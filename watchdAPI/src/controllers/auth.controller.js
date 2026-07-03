const prisma = require("../config/prisma");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken");

function slugify(value) {
    return value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

async function generateUniqueUsername(name) {
    const baseSlug = slugify(name) || "user";
    let candidate = baseSlug;
    let suffix = 1;

    while (await prisma.user.findUnique({ where: { username: candidate } })) {
        suffix += 1;
        candidate = `${baseSlug}-${suffix}`;
    }

    return candidate;
}

async function register(req, res) {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            message: "Nome, email e senha são obrigatórios."
        });
    }

    const userAlreadyExists = await prisma.user.findUnique({
        where: {
            email
        }
    });

    if (userAlreadyExists) {
        return res.status(400).json({
            message: "Usuários já existe. Email em uso"
        })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const username = await generateUniqueUsername(name);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            username
        }
    });

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
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Email e senha são obrigatórios!"
        });
    }

    const user = await prisma.user.findUnique({
        where: {
            email
        }
    });

    if (!user) {
        return res.status(400).json({
            message: "Email nao encontrado."
        });
    }

    const passwordIsValid = await bcrypt.compare(password, user.password)

    if (!passwordIsValid) {
        return res.status(400).json({
            message: "Email ou senha invalidos."
        });
    }

    const token = jwt.sign({
        id: user.id,
        email: user.email
    },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );

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

        const usernameTaken = await prisma.user.findFirst({
            where: {
                username: normalizedUsername,
                NOT: {
                    id: req.user.id
                }
            }
        });

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

    const user = await prisma.user.update({
        where: {
            id: req.user.id
        },
        data: {
            displayName,
            location,
            website,
            bio,
            ...(isChangingUsername
                ? { username: normalizedUsername, usernameChangedAt: new Date() }
                : {})
        }
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

    const user = await prisma.user.findUnique({
        where: {
            id: req.user.id
        }
    });

    const passwordIsValid = await bcrypt.compare(password, user.password);

    if (!passwordIsValid) {
        return res.status(400).json({
            message: "Senha incorreta."
        });
    }

    await prisma.user.delete({
        where: {
            id: req.user.id
        }
    });

    return res.json({
        message: "Conta excluida com sucesso."
    });
}

module.exports = {
    register,
    login,
    me,
    updateProfile,
    deleteAccount
};