const authService = require("../services/auth.service");
const { COOKIE_NAME, cookieOptions } = require("../config/cookie");

async function register(req, res) {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            message: "Nome, email e senha são obrigatórios."
        });
    }

    const userAlreadyExists = await authService.findUserByEmail(email);

    if (userAlreadyExists) {
        return res.status(400).json({
            message: "Usuários já existe. Email em uso"
        })
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

    if (!email || !password) {
        return res.status(400).json({
            message: "Email e senha são obrigatórios!"
        });
    }

    const user = await authService.findUserByEmailOrUsername(email);

    if (!user) {
        return res.status(400).json({
            message: "Email ou senha invalidos."
        });
    }

    const passwordIsValid = await authService.verifyPassword(password, user.password);

    if (!passwordIsValid) {
        return res.status(400).json({
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

    if (!password) {
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
