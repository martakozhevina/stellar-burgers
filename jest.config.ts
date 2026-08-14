import type { Config } from 'jest';

const config: Config = {
  // Использовать ts-jest или babel для компиляции TypeScript
  preset: 'ts-jest', 
  testEnvironment: 'jsdom',
  // Маппинг путей (алиасов) точно как в вашем tsconfig/webpack
  moduleNameMapper: {
    '^@api$': '<rootDir>/src/utils/burger-api.ts',
    '^@utils-types$': '<rootDir>/src/utils/types.ts',
    '^@services$': '<rootDir>/src/services/store.ts',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy' // заглушка для стилей
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  }
};

export default config;
