// Envolve um controller async para que qualquer erro nao tratado va parar no
// errorHandler em vez de derrubar a request sem resposta.
function asyncHandler(controller) {
    return function (req, res, next) {
        return Promise.resolve(controller(req, res, next)).catch(next);
    };
}

function notFoundHandler(req, res) {
    return res.status(404).json({
        message: "Rota nao encontrada."
    });
}

function errorHandler(error, req, res, next) {
    if (res.headersSent) {
        return next(error);
    }

    console.error(`[erro] ${req.method} ${req.originalUrl}:`, error);

    // Violacao de unicidade do Prisma (ex.: email ou username ja em uso).
    if (error.code === "P2002") {
        return res.status(400).json({
            message: "Esse registro ja existe."
        });
    }

    // Registro nao encontrado em update/delete.
    if (error.code === "P2025") {
        return res.status(404).json({
            message: "Registro nao encontrado."
        });
    }

    if (error.type === "entity.parse.failed") {
        return res.status(400).json({
            message: "JSON invalido no corpo da requisicao."
        });
    }

    return res.status(500).json({
        message: "Erro interno no servidor."
    });
}

module.exports = {
    asyncHandler,
    notFoundHandler,
    errorHandler
};
