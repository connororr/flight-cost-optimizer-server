const config = {
    verbose: true,
    transform: {
        "^.+\\.(ts|tsx)$": "ts-jest",
        "^.+\\.(js)$": "babel-jest",
    },
    transformIgnorePatterns: [
    ],
}

export default config;