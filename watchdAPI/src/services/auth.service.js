const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

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

async function findUserByEmail(email) {
    return prisma.user.findUnique({ where: { email } });
}

async function findUserById(id) {
    return prisma.user.findUnique({ where: { id } });
}

async function findUserByUsernameExcludingId(username, excludeId) {
    return prisma.user.findFirst({
        where: {
            username,
            NOT: { id: excludeId }
        }
    });
}

async function createUser({ name, email, password }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const username = await generateUniqueUsername(name);

    return prisma.user.create({
        data: { name, email, password: hashedPassword, username }
    });
}

async function verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
}

function signAuthToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
}

async function updateProfile(userId, data) {
    return prisma.user.update({ where: { id: userId }, data });
}

async function deleteUser(userId) {
    return prisma.user.delete({ where: { id: userId } });
}

module.exports = {
    findUserByEmail,
    findUserById,
    findUserByUsernameExcludingId,
    createUser,
    verifyPassword,
    signAuthToken,
    updateProfile,
    deleteUser
};
