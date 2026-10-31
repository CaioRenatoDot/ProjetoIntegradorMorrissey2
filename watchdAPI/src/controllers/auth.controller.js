const authService = require("../services/auth.service");
const { COOKIE_NAME, cookieOptions } = require("../config/cookie");
const { LIMITS, validateTextFields } = require("../utils/validation");

// Exigencia minima de senha. O front tem a mesma regra para dar retorno
// imediato, mas quem barra de verdade e aqui: o front pode ser contornado
// chamando a API direto.
const PASSWORD_MIN_LENGTH = 8;
// O bcrypt so considera os primeiros 72 bytes; acima disso o resto da senha
// seria ignorado sem o usuario saber.
const PASSWORD_MAX_BYTES = 72;

// Cada erro de autenticacao leva um "code" estavel alem da mensagem. O front
// traduz pelo code, entao a mensagem pode mudar sem quebrar a traducao.
function validatePassword(password) {
    if (typeof password !== "string") {
        return { code: "INVALID_FIELD", message: "A senha precisa ser texto." };
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
        return {
            code: "PASSWORD_TOO_SHORT",
            message: `A senha precisa ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres.`
        };
    }

    if (!/[a-zA-Z]/.test(password)) {
        return { code: "PASSWORD_NO_LETTER", message: "A senha precisa ter pelo menos uma letra." };
    }

    if (!/\d/.test(password)) {
        return { code: "PASSWORD_NO_NUMBER", message: "A senha precisa ter pelo menos um numero." };
    }

    if (Buffer.byteLength(password, "utf8") > PASSWORD_MAX_BYTES) {
        return {
            code: "PASSWORD_TOO_LONG",
            message: `A senha pode ter no maximo ${PASSWORD_MAX_BYTES} caracteres.`
        };
    }

    return null;
}

async function register(req, res) {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            code: "MISSING_FIELDS",
            message: "Nome, email e senha sao obrigatorios."
        });
    }

    const fieldsError = validateTextFields(req.body, {
        name: LIMITS.name,
        email: LIMITS.email
    });

    if (fieldsError) {
        return res.status(400).json({ code: "INVALID_FIELD", message: fieldsError });
    }

    const passwordError = validatePassword(password);

    if (passwordError) {
        return res.status(400).json(passwordError);
    }

    const userAlreadyExists = await authService.findUserByEmail(email);

    if (userAlreadyExists) {
        return res.status(400).json({
            code: "EMAIL_IN_USE",
            message: "Esse email ja esta cadastrado."
        });
    }

    const user = await authService.createUser({ name, email, password });

    return res.status(201).json({
        message: "Usuário criado com sucesso.",
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            username: user.username,
        }
    });
}

async function login(req, res) {
    // O campo continua chegando como "email" para nao quebrar quem ja consome
    // a API, mas aceita tambem o username.
    const { email, password } = req.body;

    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
        return res.status(400).json({
            code: "MISSING_FIELDS",
            message: "Email e senha sao obrigatorios."
        });
    }

    const user = await authService.findUserByEmailOrUsername(email);
    const passwordIsValid = user
        ? await authService.verifyPassword(password, user.password)
        : false;

    // Mesmo erro para email inexistente e senha errada, para nao revelar
    // quais emails estao cadastrados.
    if (!passwordIsValid) {
        return res.status(400).json({
            code: "INVALID_CREDENTIALS",
            message: "Email ou senha invalidos."
        });
    }

    const token = authService.signAuthToken(user);

    // A sessao vive no cookie httpOnly; o token continua no corpo apenas para
    // compatibilidade com clientes que ainda usam o header Authorization.
    res.cookie(COOKIE_NAME, token, cookieOptions);

    return res.json({
    message: "Login realizado com sucesso",
    token,
    user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username
    }
});

}

async function me(req, res){
    return res.json({
        user: req.user
    });
}

async function logout(req, res) {
    res.clearCookie(COOKIE_NAME, cookieOptions);

    return res.json({
        message: "Logout realizado com sucesso."
    });
}

async function updateProfile(req, res) {
    const { displayName, location, website, bio, username } = req.body;

    const fieldsError = validateTextFields(req.body, {
        displayName: LIMITS.displayName,
        location: LIMITS.location,
        website: LIMITS.website,
        bio: LIMITS.bio,
        username: 30
    });

    if (fieldsError) {
        return res.status(400).json({ message: fieldsError });
    }

    // O site vira link no perfil publico; aceitar so http(s) impede que
    // alguem salve um "javascript:..." que rodaria no clique de outra pessoa.
    if (website && !/^https?:\/\/\S+$/i.test(website)) {
        return res.status(400).json({
            message: "O website precisa comecar com http:// ou https://."
        });
    }

    let normalizedUsername;

    if (username !== undefined) {
        normalizedUsername = username.trim().toLowerCase();

        if (!/^[a-z0-9-]{3,30}$/.test(normalizedUsername)) {
            return res.status(400).json({
                message: "Username precisa ter de 3 a 30 caracteres: letras minusculas, numeros e hifen."
            });
        }

        const usernameTaken = await authService.findUserByUsernameExcludingId(normalizedUsername, req.user.id);

        if (usernameTaken) {
            return res.status(400).json({
                message: "Esse username ja esta em uso."
            });
        }
    }

    const isChangingUsername =
        normalizedUsername !== undefined && normalizedUsername !== req.user.username;

    if (isChangingUsername && req.user.usernameChangedAt) {
        const cooldownDays = 30;
        const daysSinceChange =
            (Date.now() - new Date(req.user.usernameChangedAt).getTime()) / (1000 * 60 * 60 * 24);

        if (daysSinceChange < cooldownDays) {
            const daysLeft = Math.ceil(cooldownDays - daysSinceChange);
            return res.status(400).json({
                message: `Voce so pode mudar o username a cada ${cooldownDays} dias. Tente novamente em ${daysLeft} dia${daysLeft === 1 ? "" : "s"}.`
            });
        }
    }

    const user = await authService.updateProfile(req.user.id, {
        displayName,
        location,
        website,
        bio,
        ...(isChangingUsername
            ? { username: normalizedUsername, usernameChangedAt: new Date() }
            : {})
    });

    return res.json({
        message: "Perfil atualizado com sucesso.",
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            username: user.username,
            usernameChangedAt: user.usernameChangedAt,
            displayName: user.displayName,
            location: user.location,
            website: user.website,
            bio: user.bio
        }
    });
}

async function deleteAccount(req, res) {
    const { password } = req.body;

    if (!password || typeof password !== "string") {
        return res.status(400).json({
            message: "Informe sua senha para excluir a conta."
        });
    }

    const user = await authService.findUserById(req.user.id);

    const passwordIsValid = await authService.verifyPassword(password, user.password);

    if (!passwordIsValid) {
        return res.status(400).json({
            message: "Senha incorreta."
        });
    }

    await authService.deleteUser(req.user.id);

    res.clearCookie(COOKIE_NAME, cookieOptions);

    return res.json({
        message: "Conta excluida com sucesso."
    });
}

module.exports = {
    register,
    login,
    logout,
    me,
    updateProfile,
    deleteAccount
};
