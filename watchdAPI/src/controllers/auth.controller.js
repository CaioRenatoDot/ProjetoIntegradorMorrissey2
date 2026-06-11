const prisma = require("../config/prisma");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken");

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

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword
        }
    });

    return res.status(201).json({
        message: "Usuário criado com sucesso.",
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
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
            message: "Email ou senha errados."
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
        email: user.email
    }
});

}

async function me(req, res){
    return res.json({
        user: req.user
    });
}




module.exports = {
    register,
    login,
    me
};