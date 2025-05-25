import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    // testMatch: [
    //     '**/__tests__/**/*.[jt]s?(x)',
    //     '**/?(*.)+(spec|test).[tj]s?(x)',
    //     '**/tests/integration/**/*.test.ts' // Include integration tests
    // ],
    moduleNameMapper: {
        '^@src/(.*)$': '<rootDir>/src/$1',
        '^@application/(.*)$': '<rootDir>/src/application/$1',
        '^@domain/(.*)$': '<rootDir>/src/domain/$1',
        '^@infrastructure/(.*)$': '<rootDir>/src/infrastructure/$1',
        '^@presentation/(.*)$': '<rootDir>/src/presentation/$1',
        '^@config/(.*)$': '<rootDir>/src/config/$1',
    },
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
};

export default config;