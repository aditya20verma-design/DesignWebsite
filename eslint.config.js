// eslint.config.js — flat config (ESLint 9+)
export default [
    {
        files: ['script.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'script',
            globals: {
                // Browser globals
                window: 'readonly',
                document: 'readonly',
                navigator: 'readonly',
                console: 'readonly',
                requestAnimationFrame: 'readonly',
                cancelAnimationFrame: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                setInterval: 'readonly',
                clearInterval: 'readonly',
                // CDN library globals
                gsap: 'readonly',
                ScrollTrigger: 'readonly',
                Lenis: 'readonly',
                SplitType: 'readonly',
                UnicornStudio: 'readonly',
                // Additional browser APIs used in script.js
                MutationObserver: 'readonly',
                Node: 'readonly',
                NodeFilter: 'readonly',
            },
        },
        rules: {
            'no-unused-vars': 'warn',
            'no-undef': 'error',
            'no-console': 'off',
            eqeqeq: ['warn', 'always'],
            'prefer-const': 'warn',
        },
    },
];
