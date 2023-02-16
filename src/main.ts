/*
* package: vue2-to-composition-api
* e-mail: diquick@qq.com
* author: wd3322
*/

declare global {
  interface Window {
    Vue2ToCompositionApiVmBody: any
  }
}

function Vue2ToCompositionApi(
  entryScriptContent: string = '',
  options: {
    isDebug?: boolean
  } = {
    isDebug: false
  }
): any {
  if (
    typeof entryScriptContent === 'string' &&
    typeof options === 'object' &&
    Object.keys(options).length > 0
  ) {
    try {
      // output script content init
      let outputScriptContent: string = ''

      // js-beautify init
      const jsBeautify: any = require('js-beautify')
      const jsBeautifyOptions: any = {
        indent_size: 4,
        indent_char: '',
        indent_with_tabs: true,
        editorconfig: false,
        eol: '\n',
        end_with_newline: false,
        indent_level: 0,
        preserve_newlines: true,
        max_preserve_newlines: 10,
        space_in_paren: false,
        space_in_empty_paren: false,
        jslint_happy: false,
        space_after_anon_function: false,
        space_after_named_function: false,
        brace_style: 'collapse-preserve-inline',
        unindent_chained_methods: false,
        break_chained_methods: false,
        keep_array_indentation: false,
        unescape_strings: false,
        wrap_line_length: 0,
        e4x: false,
        comma_first: false,
        operator_position: 'before-newline',
        indent_empty_lines: false,
        templating: ['auto']
      }

      // vm body init
      window.Vue2ToCompositionApiVmBody = {}
      const scriptContent: string = jsBeautify(entryScriptContent, jsBeautifyOptions)
      eval(scriptContent.replace('export default', 'window.Vue2ToCompositionApiVmBody ='))
      const vmBody: any = window.Vue2ToCompositionApiVmBody

      // vm content init
      const vmContent: any = {
        props: vmBody.props && typeof vmBody.props === 'object' ? vmBody.props : {},
        data: vmBody.data && typeof vmBody.data === 'function' ? vmBody.data : () => ({}),
        dataOptions: vmBody.data && typeof vmBody.data === 'function' ? vmBody.data() : {},
        computed: vmBody.computed && typeof vmBody.computed === 'object' ? vmBody.computed : {},
        watch: vmBody.watch && typeof vmBody.watch === 'object' ? vmBody.watch : {},
        methods: vmBody.methods && typeof vmBody.methods === 'object' ? vmBody.methods : {},
        filters: vmBody.filters && typeof vmBody.filters === 'object' ? vmBody.filters : {},
        hooks: {},
        emits: [],
        refs: [],
        use: {},
        import: { vue: [], 'vue-router': [], vuex: [] }
      }

      // vm hooks content init
      for (const prop in vmBody) {
        if ([
          'beforeCreate', 'created', 'beforeMount', 'mounted',
          'beforeUpdate', 'updated', 'beforeDestroy', 'destroyed',
          'activated', 'deactivated', 'errorCaptured'].includes(prop) &&
          typeof vmBody[prop] === 'function'
        ) {
          vmContent.hooks[prop] = vmBody[prop]
        }
      }

      // vm keys init
      const vmKeys: any = {
        props: Object.keys(vmContent.props),
        data: Object.keys(vmContent.dataOptions),
        computed: Object.keys(vmContent.computed),
        watch: Object.keys(vmContent.watch),
        methods: Object.keys(vmContent.methods),
        filters: Object.keys(vmContent.filters),
        hooks: Object.keys(vmContent.hooks),
        use: () => Object.keys(vmContent.use),
        import: () => Object.keys(vmContent.import)
      }

      // vm output init
      const vmOutput: any = {
        import: '',
        use: '',
        props: '',
        emits: '',
        refs: '',
        data: '',
        computed: '',
        watch: '',
        hooks: '',
        methods: '',
        filters: ''
      }

      // vm set content methods init
      const vmSetContentMethods: any = {
        porps(): void {
          if (
            vmKeys.props.length > 0 &&
            vmContent.props !== null &&
            typeof vmContent.props === 'object'
          ) {
            const propsContentStr: string = utilMethods.getContentStr(vmContent.props, {
              arrowFunction: true
            })
            if (propsContentStr) {
              vmOutput.props = `const props = defineProps(${propsContentStr})`
            }
          }
        },
        data(): void {
          if (
            vmKeys.data.length > 0 &&
            vmContent.dataOptions !== null &&
            typeof vmContent.dataOptions === 'object'
          ) {
            const dataFunctionStr: string = utilMethods.getContentStr(vmContent.data, {
              replaceDataKeyToUseData: true
            })
            if (dataFunctionStr) {
              const dataContentStr: string = dataFunctionStr.substring(dataFunctionStr.indexOf('return {\n') + 7, dataFunctionStr.length - 1)
              vmOutput.data = `const data = reactive(${dataContentStr})`
              utilMethods.addImport('vue', 'reactive')
            }
          }
        },
        computed(): void {
          if (
            vmKeys.computed.length > 0 &&
            vmContent.computed !== null &&
            typeof vmContent.computed === 'object'
          ) {
            const computedValues: string[] = []
            for (const prop in vmContent.computed) {
              const computedContent: any = vmContent.computed[prop]
              if (
                computedContent !== null &&
                (typeof computedContent === 'object' || typeof computedContent === 'function')
              ) {
                const computedName: string = typeof computedContent === 'function' ? computedContent.name : prop
                const computedFunctionStr: string = utilMethods.getContentStr(computedContent, {
                  arrowFunction: true
                })
                if (computedName && computedFunctionStr) {
                  computedValues.push(`const ${computedName} = computed(${computedFunctionStr})`)
                }
              }
            }
            if (computedValues.length > 0) {
              vmOutput.computed = computedValues.join('\n\n')
              utilMethods.addImport('vue', 'computed')
            }
          }
        },
        watch(): void {
          if (
            vmKeys.watch.length > 0 &&
            vmContent.watch !== null &&
            typeof vmContent.watch === 'object'
          ) {
            const watchValues: string[] = []
            for (const prop in vmContent.watch) {
              const watchContent: any = vmContent.watch[prop]
              if (typeof watchContent === 'function') {
                const watchName: string = utilMethods.replaceKey(watchContent.name)
                const watchFunctionStr: string = utilMethods.getContentStr(watchContent, {
                  arrowFunction: true
                })
                if (watchName && watchFunctionStr) {
                  watchValues.push(`watch(() => ${watchName}, ${watchFunctionStr})`)
                }
              } else if (
                watchContent !== null &&
                typeof watchContent === 'object' &&
                typeof watchContent.handler === 'function'
              ) {
                const watchName: string = utilMethods.replaceKey(prop)
                const watchFunctionStr: string = utilMethods.getContentStr(watchContent.handler, {
                  arrowFunction: true
                })
                const watchOptionsStr: string = utilMethods.getContentStr(watchContent, {
                  excludeProps: ['handler']
                })
                if (watchName && watchFunctionStr && watchOptionsStr) {
                  watchValues.push(
                    watchOptionsStr !== '{}'
                      ? `watch(() => ${watchName}, ${watchFunctionStr}, ${watchOptionsStr})`
                      : `watch(() => ${watchName}, ${watchFunctionStr})`
                  )
                }
              }
            }
            if (watchValues.length > 0) {
              vmOutput.watch = watchValues.join('\n\n')
              utilMethods.addImport('vue', 'watch')
            }
          }
        },
        hooks(): void {
          if (
            vmKeys.hooks.length > 0 &&
            vmContent.hooks !== null &&
            typeof vmContent.hooks === 'object'
          ) {
            const hookValues: string[] = []
            for (const prop in vmContent.hooks) {
              const hookContent: any = vmContent.hooks[prop]
              if (typeof hookContent === 'function') {
                if (['beforeCreate', 'created'].includes(hookContent.name)) {
                  const hookName: string = `on${hookContent.name.substring(0, 1).toUpperCase()}${hookContent.name.substring(1)}`
                  const hookFunctionStr: string = utilMethods.getContentStr(hookContent)
                  if (hookName && hookFunctionStr) {
                    hookValues.push(
                      hookContent.constructor.name === 'AsyncFunction'
                        ? `async function ${hookName} ${hookFunctionStr}\n${hookName}()`
                        : `function ${hookName} ${hookFunctionStr}\n${hookName}()`
                    )
                  }
                } else if ([
                  'beforeMount', 'mounted', 'beforeUpdate', 'updated', 'beforeDestroy', 'destroyed',
                  'activated', 'deactivated', 'errorCaptured'].includes(hookContent.name)
                ) {
                  const v3HooksNameDist: any = {
                    beforeMount: 'onBeforeMount',
                    mounted: 'onMounted',
                    beforeUpdate: 'onBeforeUpdate',
                    updated: 'onUpdated',
                    beforeDestroy: 'onBeforeUnmount',
                    destroyed: 'onUnmounted',
                    activated: 'onActivated',
                    deactivated: 'onDeactivated',
                    errorCaptured: 'onErrorCaptured'
                  }
                  const hookName: string = v3HooksNameDist[hookContent.name as string]
                  const hookFunctionStr: string = utilMethods.getContentStr(hookContent, {
                    arrowFunction: true
                  })
                  if (hookName && hookFunctionStr) {
                    hookValues.push(
                      hookContent.constructor.name === 'AsyncFunction'
                        ? `${hookName} (async ${hookFunctionStr})`
                        : `${hookName} (${hookFunctionStr})`
                    )
                    utilMethods.addImport('vue', hookName)
                  }
                }
              }
            }
            if (hookValues.length > 0) {
              vmOutput.hooks = hookValues.join('\n\n')
            }
          }
        },
        methods(): void {
          if (
            vmKeys.methods.length > 0 &&
            vmContent.methods !== null &&
            typeof vmContent.methods === 'object'
          ) {
            const methodValues: string[] = []
            for (const prop in vmContent.methods) {
              const methodContent: any = vmContent.methods[prop]
              if (typeof methodContent === 'function') {
                const methodName: string = methodContent.name
                const methodFunctionStr: string = utilMethods.getContentStr(methodContent)
                if (methodName && methodFunctionStr) {
                  methodValues.push(
                    methodContent.constructor.name === 'AsyncFunction'
                      ? `async function ${methodName} ${methodFunctionStr}`
                      : `function ${methodName} ${methodFunctionStr}`
                  )
                }
              }
            }
            if (methodValues.length > 0) {
              vmOutput.methods = methodValues.join('\n\n')
            }
          }
        },
        filters(): void {
          if (
            vmKeys.filters.length > 0 &&
            vmContent.filters !== null &&
            typeof vmContent.filters === 'object'
          ) {
            const filterValues: string[] = []
            for (const prop in vmContent.filters) {
              const filterContent: any = vmContent.filters[prop]
              if (typeof filterContent === 'function') {
                const filterName: string = filterContent.name
                const filterFunctionStr: string = utilMethods.getContentStr(filterContent)
                if (filterName && filterFunctionStr) {
                  filterValues.push(`function ${filterName} ${filterFunctionStr}`)
                }
              }
            }
            if (filterValues.length > 0) {
              vmOutput.filters = filterValues.join('\n\n')
            }
          }
        },
        emits(): void {
          if (
            vmContent.emits instanceof Array &&
            vmContent.emits.length > 0
          ) {
            const emitValues: string[] = []
            for (const emits of vmContent.emits) {
              const emitContent: string = emits.split('update:').pop()
              if (emitContent) {
                emitValues.push(`\'${emitContent}\'`)
              }
            }
            if (emitValues.length > 0) {
              vmOutput.emits = `const emit = defineEmits([${emitValues.join(', ')}])`
            }
          }
        },
        refs(): void {
          if (
            vmContent.refs instanceof Array &&
            vmContent.refs.length > 0
          ) {
            const refValues: string[] = []
            for (const ref of vmContent.refs) {
              if (ref) {
                refValues.push(`const ${ref} = ref(null)`)
              }
            }
            if (refValues.length > 0) {
              vmOutput.refs = refValues.join('\n')
              utilMethods.addImport('vue', 'ref')
            }
          }
        },
        use(): void {
          if (
            vmKeys.use().length > 0 &&
            vmContent.use !== null &&
            typeof vmContent.use === 'object'
          ) {
            const useValues: string[] = []
            for (const prop in vmContent.use) {
              const useContent: string = vmContent.use[prop]
              if (useContent) {
                useValues.push(useContent)
              }
            }
            if (useValues.length > 0) {
              vmOutput.use = useValues.sort().join('\n')
            }
          }
        },
        import(): void {
          if (
            vmKeys.import().length > 0 &&
            vmContent.import !== null &&
            typeof vmContent.import === 'object'
          ) {
            const importValues: string[] = []
            for (const prop in vmContent.import) {
              const importContent: string[] = vmContent.import[prop]
              if (importContent.length > 0) {
                importValues.push(`import { ${importContent.sort().join(', ')} } from \'${prop}\'`)
              }
            }
            if (importValues.length > 0) {
              vmOutput.import = importValues.join('\n')
            }
          }
        },
        output(): void {
          const outputValues: string[] = []
          for (const prop in vmOutput) {
            const outputContent: string = vmOutput[prop]
            if (outputContent) {
              outputValues.push(outputContent)
            }
          }
          if (outputValues.length > 0) {
            outputScriptContent = outputValues.join('\n\n')
          }
        }
      }

      // util methods init
      const utilMethods: any = {
        getIndexArr(
          {
            values = [],
            content = '',
            start = 0,
            append = false
          }: {
            values: string[],
            content: string,
            start: number,
            append: boolean
          }
        ): number[] {
          const result: number[] = []
          if (
            values instanceof Array &&
            typeof content === 'string' &&
            typeof start === 'number' &&
            typeof append === 'boolean'
          ) {
            for (const value of values) {
              const valueIndex: number = content.indexOf(value, start)
              if (valueIndex !== -1) {
                result.push(append ? valueIndex + (+value.length) : valueIndex)
              }
            }
          }
          return result
        },
        getContentStr(
          value: any,
          options: {
            arrowFunction?: boolean,
            excludeProps?: string[],
            replaceDataKeyToUseData?: boolean
          } = {
            arrowFunction: false,
            excludeProps: [],
            replaceDataKeyToUseData: false
          }
        ): string {
          let result: string = ''
          if (
            typeof options === 'object' &&
            Object.keys(options).length > 0
          ) {
            if (typeof value === 'string') {
              result = `\'${value}\'`
            } else if (typeof value === 'function') {
              let content: string = value.toString()
              if (content.includes('[native code]')) {
                result = `${value.name}`
              } else {
                content = utilMethods.replaceKey(content, {
                  separator: 'this.',
                  dataKeyToUseData: options.replaceDataKeyToUseData
                })
                const arg: string = content.substring(
                  content.indexOf('(') + 1,
                  Math.min(
                    ...utilMethods.getIndexArr({
                      values: [') {', ') =>'],
                      content,
                      start: 0,
                      append: false
                    })
                  )
                )
                const body: string = content.substring(
                  Math.min(
                    ...utilMethods.getIndexArr({
                      values: [') {', ') => '],
                      content,
                      start: 0,
                      append: true
                    })
                  ) - 1,
                  content.length
                )
                result = options.arrowFunction ? `(${arg}) => ${body}` : `(${arg}) ${body}`
              }
            } else if (value instanceof Array) {
              const values: string[] = []
              for (const item of value) {
                const content: string = utilMethods.getContentStr(item, options)
                values.push(content)
              }
              result = values.length > 0 ? `[${values.join(', ')}]` : '[]'
            } else if (typeof value === 'object' && value !== null) {
              const values: string[] = []
              for (const prop in value) {
                if (!options.excludeProps?.includes(prop)) {
                  const content: string = utilMethods.getContentStr(value[prop], options)
                  values.push(`${prop}: ${content}`)
                }
              }
              result = values.length > 0 ? `{\n${values.join(',\n')}\n}` : '{}'
            } else {
              result = `${value}`
            }
          }
          return result
        },
        replaceKey(
          value: string,
          options: {
            separator?: string | undefined,
            dataKeyToUseData?: boolean
          } = {
            separator: undefined,
            dataKeyToUseData: false
          }
        ): string {
          let result: string = ''
          if (
            typeof value === 'string' &&
            typeof options === 'object' &&
            Object.keys(options).length > 0
          ) {
            const contents: string[] = options.separator ? value.split(options.separator) : [value]
            const contentsBeginIndex: number = options.separator ? 1 : 0
            if (contents.length > contentsBeginIndex) {
              for (let i = contentsBeginIndex; i < contents.length; i++) {
                const content: string = contents[i]
                const key: string = content.substring(0, Math.min(
                  ...utilMethods.getIndexArr({
                    values: ['\n', '\t', ' ', '.', ',', ';', '?', '[', ']', ')', '(', '+', '-'],
                    content,
                    start: 0,
                    append: false
                  })
                ))
                if (vmKeys.props.includes(key)) {
                  contents[i] = content.replace(key, `props.${key}`)
                } else if (vmKeys.data.includes(key) && options.dataKeyToUseData) {
                  contents[i] = content.replace(key, `useData().${key}`)
                  utilMethods.addUse('data')
                } else if (vmKeys.data.includes(key)) {
                  contents[i] = content.replace(key, `data.${key}`)
                } else if (vmKeys.computed.includes(key)) {
                  contents[i] = content.replace(key, `${key}.value`)
                } else if (vmKeys.methods.includes(key)) {
                  contents[i] = content
                } else if ([
                  '$data', '$props', '$el', '$options', '$parent', '$root', '$children', '$isServer',
                  '$listeners', '$watch', '$on', '$once', '$off', '$mount', '$forceUpdate', '$destroy'].includes(key)
                ) {
                  contents[i] = content.replace(key, `$vm.${key}`)
                  utilMethods.addImport('vue', 'getCurrentInstance')
                  utilMethods.addUse('vm')
                } else if ([
                  '$attrs', '$slots', '$router', '$route', '$store', '$nextTick', '$set', '$delete'].includes(key)
                ) {
                  contents[i] = content.replace('$', '')
                  if (key === '$attrs') {
                    utilMethods.addImport('vue', 'useAttrs')
                    utilMethods.addUse('attrs')
                  } else if (key === '$slots') {
                    utilMethods.addImport('vue', 'useSlots')
                    utilMethods.addUse('slots')
                  } else if (key === '$router') {
                    utilMethods.addImport('vue-router', 'useRouter')
                    utilMethods.addUse('router')
                  } else if (key === '$route') {
                    utilMethods.addImport('vue-router', 'useRoute')
                    utilMethods.addUse('route')
                  } else if (key === '$store') {
                    utilMethods.addImport('vuex', 'useStore')
                    utilMethods.addUse('store')
                  } else if (key === '$nextTick') {
                    utilMethods.addImport('vue', 'nextTick')
                  } else if (key === '$set') {
                    utilMethods.addImport('vue', 'set')
                  } else if (key === '$delete') {
                    contents[i] = contents[i].replace('delete', 'del')
                    utilMethods.addImport('vue', 'del')
                  }
                } else if (key === '$emit') {
                  const beginIndex: number = Math.min(
                    ...utilMethods.getIndexArr({
                      values: ['$emit(\'', '$emit("', '$emit(`', '$emit([\'', '$emit(["', '$emit([`'],
                      content,
                      start: 0,
                      append: true
                    })
                  )
                  const endIndex: number = Math.min(
                    ...utilMethods.getIndexArr({
                      values: ['\'', '"', '`'],
                      content,
                      start: beginIndex,
                      append: false
                    })
                  )
                  const emitName: string = content.substring(beginIndex, endIndex)
                  if (emitName) {
                    if (!vmContent.emits.includes(emitName)) {
                      vmContent.emits.push(emitName)
                    }
                    contents[i] = content.replace('$', '')
                  } else {
                    contents[i] = content.replace(key, `/* Warn: Cannot find emit event */${options.separator}${key}`)
                  }
                } else if (key === '$refs') {
                  const beginIndex: number = Math.min(
                    ...utilMethods.getIndexArr({
                      values: ['$refs.', '$refs?.'],
                      content,
                      start: 0,
                      append: true
                    })
                  )
                  const endIndex: number = Math.min(
                    ...utilMethods.getIndexArr({
                      values: ['\n', '\t', ' ', '.', ',', '?', '[', ')'],
                      content,
                      start: beginIndex,
                      append: false
                    })
                  )
                  const refsName: string = content.substring(beginIndex, endIndex)
                  if (refsName) {
                    if (!vmContent.refs.includes(refsName)) {
                      vmContent.refs.push(refsName)
                    }
                    contents[i] = `${refsName}.value${content.substring(content.indexOf(refsName) + refsName.length, content.length)}`
                  } else {
                    contents[i] = content.replace(key, `/* Warn: Cannot find refs name */${options.separator}${key}`)
                  }
                } else if (key) {
                  contents[i] = content.replace(key, `/* Warn: Unknown source '${key}' */${options.separator}${key}`)
                } else {
                  contents[i] = options.separator ? content.replace(key, `${options.separator}${key}`) : `${content}`
                }
              }
            }
            result = contents.join('')
          }
          return result
        },
        addImport(type: string, value: string): void {
          if (
            typeof type === 'string' &&
            typeof value === 'string' &&
            ['vue', 'vue-router', 'vuex'].includes(type)
          ) {
            const importContent: string[] = vmContent.import[type]
            if (!importContent?.includes(value)) {
              importContent.push(value)
            }
          }
        },
        addUse(type: string): void {
          if (
            typeof type === 'string' &&
            ['data', 'vm', 'attrs', 'slots', 'router', 'route', 'store'].includes(type)
          ) {
            const contentDist: any = {
              vm: 'const { proxy: $vm } = getCurrentInstance()',
              data: 'const useData = () => data',
              attrs: 'const attrs = useAttrs()',
              slots: 'const slots = useSlots()',
              router: 'const router = useRouter()',
              route: 'const route = useRoute()',
              store: 'const store = useStore()'
            }
            const useContent: string = contentDist[type]
            if (useContent) {
              vmContent.use[type] = useContent
            }
          }
        }
      }

      // vm set content methods runing
      for (const prop in vmSetContentMethods) {
        if (typeof vmSetContentMethods[prop] === 'function') {
          vmSetContentMethods[prop]()
        }
      }

      // output script content beautify
      outputScriptContent = jsBeautify(outputScriptContent, jsBeautifyOptions)

      // debug console log
      if (options.isDebug) {
        console.log('Vue2ToCompositionApi', {
          entryScriptContent,
          outputScriptContent,
          vmBody,
          vmContent,
          vmOutput,
          vmKeys
        })
      }

      // done
      return outputScriptContent
    } catch (err: any) {
      throw new Error(err)
    }
  }
}

export default Vue2ToCompositionApi
