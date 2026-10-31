// Limites de tamanho dos campos de texto. Os que tambem existem no front
// (bio, review, display name...) usam o mesmo valor do maxLength de la; o
// front pode ser contornado chamando a API direto, entao quem barra e aqui.
const LIMITS = {
    name: 60,
    email: 254,
    displayName: 32,
    location: 100,
    website: 100,
    bio: 240,
    reviewText: 280,
    listTitle: 80,
    listCategory: 40,
    movieId: 20,
    seriesTitle: 200,
    posterUrl: 500,
    releaseYear: 10,
    type: 40
};

// Campos que todo snapshot de serie carrega (watchlist, favoritos, listas e
// reviews).
const SERIES_FIELDS = {
    movieId: LIMITS.movieId,
    title: LIMITS.seriesTitle,
    posterUrl: LIMITS.posterUrl,
    releaseYear: LIMITS.releaseYear,
    type: LIMITS.type
};

// Recebe { campo: tamanhoMaximo } e devolve a primeira mensagem de erro, ou
// null se tudo estiver certo. Campos ausentes (undefined/null) sao ignorados:
// a obrigatoriedade continua sendo checada em cada controller.
function validateTextFields(body, limits) {
    for (const [field, maxLength] of Object.entries(limits)) {
        const value = body[field];

        if (value === undefined || value === null) continue;

        if (typeof value !== "string") {
            return `${field} precisa ser texto.`;
        }

        if (value.length > maxLength) {
            return `${field} pode ter no maximo ${maxLength} caracteres.`;
        }
    }

    return null;
}

module.exports = {
    LIMITS,
    SERIES_FIELDS,
    validateTextFields
};
