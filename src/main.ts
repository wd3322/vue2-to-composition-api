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

interface VmContent {
  props: any,
  data: Function,
  dataOptions: any,
  computed: any,
  watch: any,
  methods: any,
  filters: any,
  hooks: any,
  emits: string[],
  refs: string[],
  use: any,
  import: any
}

interface VmKeys {
  props: string[],
  data: string[],
  computed: string[],
  watch: string[],
  methods: string[],
  filters: string[],
  hooks: string[],
  use: Function,
  import: Function
}

interface VmOutput {
  import: string,
  use: string,
  props: string,
  emits: string,
  refs: string,
  data: string,
  computed: string,
  watch: string,
  hooks: string,
  methods: string,
  filters: string
}

interface VmSetContentMethods {
  props: Function,
  data: Function,
  computed: Function,
  watch: Function,
  hooks: Function,
  methods: Function,
  filters: Function,
  emits: Function,
  refs: Function,
  use: Function,
  import: Function,
  output: Function
}

interface UtilsMethods {
  getIndexArr: Function,
  getContentStr: Function,
  replaceKey: Function,
  addImport: Function,
  addUse: Function
}

function getPrototype(value: any): string {
  return Object.prototype.toString.call(value).replace(/^\[object (\S+)\]$/, '$1').toLowerCase()
}

function Vue2ToCompositionApi(
  entryScriptContent: string = '',
  options: {
    isDebug?: boolean
  } = {
    isDebug: false
  }
): string | undefined {
  if (getPrototype(entryScriptContent) !== 'string') {
    throw new Error(`Vue2ToCompositionApi ${entryScriptContent} is not a string`)
  }
  if (getPrototype(options) !== 'object') {
    throw new Error(`Vue2ToCompositionApi ${options} is not a object`)
  }
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
    const vmContent: VmContent = {
      props: getPrototype(vmBody.props) === 'object' ? vmBody.props : {},
      data: getPrototype(vmBody.data).indexOf('function') !== -1 ? vmBody.data : () => ({}),
      dataOptions: getPrototype(vmBody.data).indexOf('function') !== -1 ? vmBody.data() : {},
      computed: getPrototype(vmBody.computed) === 'object' ? vmBody.computed : {},
      watch: getPrototype(vmBody.watch) === 'object' ? vmBody.watch : {},
      methods: getPrototype(vmBody.methods) === 'object' ? vmBody.methods : {},
      filters: getPrototype(vmBody.filters) === 'object' ? vmBody.filters : {},
      hooks: {},
      emits: [],
      refs: [],
      use: {},
      import: { vue: [], 'vue-router': [], vuex: [] }
    }

    // vm hooks content init
    for (const prop in vmBody) {
      if (
        ['beforeCreate', 'created', 'beforeMount', 'mounted',
          'beforeUpdate', 'updated', 'beforeDestroy', 'destroyed',
          'activated', 'deactivated', 'errorCaptured'].includes(prop) &&
        getPrototype(vmBody[prop]).indexOf('function') !== -1
      ) {
        vmContent.hooks[prop] = vmBody[prop]
      }
    }

    // vm keys init
    const vmKeys: VmKeys = {
      props: Object.keys(vmContent.props),
      data: Object.keys(vmContent.dataOptions),
      computed: Object.keys(vmContent.computed),
      watch: Object.keys(vmContent.watch),
      methods: Object.keys(vmContent.methods),
      filters: Object.keys(vmContent.filters),
      hooks: Object.keys(vmContent.hooks),
      use: (): string[] => Object.keys(vmContent.use),
      import: (): string[] => Object.keys(vmContent.import)
    }

    // vm output init
    const vmOutput: VmOutput = {
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
    const vmSetContentMethods: VmSetContentMethods = {
      props(): void {
        if (vmKeys.props.length === 0 || getPrototype(vmContent.props) !== 'object') {
          return
        }
        const propsContentStr: string = utilMethods.getContentStr(vmContent.props, {
          arrowFunction: true
        })
        if (propsContentStr) {
          vmOutput.props = `const props = defineProps(${propsContentStr})`
        }
      },
      data(): void {
        if (vmKeys.data.length === 0 || getPrototype(vmContent.dataOptions) !== 'object') {
          return
        }
        const dataFunctionStr: string = utilMethods.getContentStr(vmContent.data, {
          replaceDataKeyToUseData: true
        })
        if (dataFunctionStr) {
          const dataContentStr: string = dataFunctionStr.substring(dataFunctionStr.indexOf('return {\n') + 7, dataFunctionStr.length - 1)
          vmOutput.data = `const data = reactive(${dataContentStr})`
          utilMethods.addImport('vue', 'reactive')
        }
      },
      computed(): void {
        if (vmKeys.computed.length === 0 || getPrototype(vmContent.computed) !== 'object') {
          return
        }
        const computedValues: string[] = []
        for (const prop in vmContent.computed) {
          const computedContent: any = vmContent.computed[prop]
          if (
            computedContent &&
            ['object', 'function', 'asyncfunction'].includes(getPrototype(computedContent))
          ) {
            const computedName: string = getPrototype(computedContent).indexOf('function') !== -1 ? computedContent.name : prop
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
      },
      watch(): void {
        if (vmKeys.watch.length === 0 || getPrototype(vmContent.watch) !== 'object') {
          return
        }
        const watchValues: string[] = []
        for (const prop in vmContent.watch) {
          const watchContent: any = vmContent.watch[prop]
          if (getPrototype(watchContent).indexOf('function') !== -1) {
            const watchName: string = utilMethods.replaceKey(watchContent.name)
            const watchFunctionStr: string = utilMethods.getContentStr(watchContent, {
              arrowFunction: true
            })
            if (watchName && watchFunctionStr) {
              watchValues.push(`watch(() => ${watchName}, ${watchFunctionStr})`)
            }
          } else if (
            watchContent &&
            getPrototype(watchContent) === 'object' &&
            getPrototype(watchContent.handler).indexOf('function') !== -1
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
      },
      hooks(): void {
        if (vmKeys.hooks.length === 0 || getPrototype(vmContent.hooks) !== 'object') {
          return
        }
        const hookValues: string[] = []
        for (const prop in vmContent.hooks) {
          const hookContent: any = vmContent.hooks[prop]
          if (getPrototype(hookContent).indexOf('function') !== -1) {
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
            } else if (
              ['beforeMount', 'mounted', 'beforeUpdate', 'updated', 'beforeDestroy', 'destroyed',
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
      },
      methods(): void {
        if (vmKeys.methods.length === 0 || getPrototype(vmContent.methods) !== 'object') {
          return
        }
        const methodValues: string[] = []
        for (const prop in vmContent.methods) {
          const methodContent: any = vmContent.methods[prop]
          if (getPrototype(methodContent).indexOf('function') !== -1) {
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
      },
      filters(): void {
        if (vmKeys.filters.length === 0 || getPrototype(vmContent.filters) !== 'object') {
          return
        }
        const filterValues: string[] = []
        for (const prop in vmContent.filters) {
          const filterContent: any = vmContent.filters[prop]
          if (getPrototype(filterContent).indexOf('function') !== -1) {
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
      },
      emits(): void {
        if (getPrototype(vmContent.emits) !== 'array' || vmContent.emits.length === 0) {
          return
        }
        const emitValues: string[] = []
        for (const emits of vmContent.emits) {
          const emitContent: string | undefined = emits.split('update:').pop()
          if (emitContent) {
            emitValues.push(`\'${emitContent}\'`)
          }
        }
        if (emitValues.length > 0) {
          vmOutput.emits = `const emit = defineEmits([${emitValues.join(', ')}])`
        }
      },
      refs(): void {
        if (getPrototype(vmContent.refs) !== 'array' || vmContent.refs.length === 0) {
          return
        }
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
      },
      use(): void {
        if (vmKeys.use().length === 0 || getPrototype(vmContent.use) !== 'object') {
          return
        }
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
      },
      import(): void {
        if (vmKeys.import().length === 0 || getPrototype(vmContent.import) !== 'object') {
          return
        }
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
      },
      output(): void {
        const outputValues: string[] = []
        for (const prop in vmOutput) {
          const outputContent: string = vmOutput[prop as keyof VmOutput]
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
    const utilMethods: UtilsMethods = {
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
      ): number[] | undefined {
        if (
          getPrototype(values) !== 'array' ||
          getPrototype(content) !== 'string' ||
          getPrototype(start) !== 'number' ||
          getPrototype(append) !== 'boolean'
        ) {
          return
        }
        const result: number[] = []
        for (const value of values) {
          const valueIndex: number = content.indexOf(value, start)
          if (valueIndex !== -1) {
            result.push(append ? valueIndex + (+value.length) : valueIndex)
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
      ): string | undefined {
        if (getPrototype(options) !== 'object') {
          return
        }
        let result: string = ''
        if (getPrototype(value) === 'string') {
          result = `\'${value}\'`
        } else if (getPrototype(value).indexOf('function') !== -1) {
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
        } else if (getPrototype(value) === 'array') {
          const values: string[] = []
          for (const item of value) {
            const content: string = utilMethods.getContentStr(item, options)
            values.push(content)
          }
          result = values.length > 0 ? `[${values.join(', ')}]` : '[]'
        } else if (getPrototype(value) === 'object') {
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
      ): string | undefined {
        if (getPrototype(value) !== 'string' || getPrototype(options) !== 'object') {
          return
        }
        let result: string = ''
        const contents: string[] = options.separator ? value.split(options.separator) : [value]
        const contentsBeginIndex: number = options.separator ? 1 : 0
        if (contents.length > contentsBeginIndex) {
          for (let i = contentsBeginIndex; i < contents.length; i++) {
            const content: string = contents[i]
            const terminator: string[] = [
              '\n', '\t', '\'', '\"', '\`', '\ ',
              '.', ',', ';', '?', '!', '[', ']', '{', '}', ')', '(',
              '=', '+', '-', '*', '/', '%', '>', '<', '^', '~', '&', '|'
            ]
            const key: string = content.substring(0, Math.min(
              ...utilMethods.getIndexArr({
                values: terminator,
                content,
                start: 0,
                append: false
              })
            ))
            const resetCurrentInstance: any = (message: string): void => {
              contents[i] = content.replace(key, `/* Warn: ${message} */ $vm.${key}`)
              utilMethods.addImport('vue', 'getCurrentInstance')
              utilMethods.addUse('vm')
            }
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
            } else if (
              ['$data', '$props', '$el', '$options', '$parent', '$root', '$children', '$isServer',
                '$listeners', '$watch', '$on', '$once', '$off', '$mount', '$forceUpdate', '$destroy'].includes(key)
            ) {
              contents[i] = content.replace(key, `$vm.${key}`)
              utilMethods.addImport('vue', 'getCurrentInstance')
              utilMethods.addUse('vm')
            } else if (
              ['$attrs', '$slots', '$router', '$route', '$store', '$nextTick', '$set', '$delete'].includes(key)
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
                  values: ['$emit(\'', '$emit(\"', '$emit(\`', '$emit([\'', '$emit([\"', '$emit([\`'],
                  content,
                  start: 0,
                  append: true
                })
              )
              const endIndex: number = Math.min(
                ...utilMethods.getIndexArr({
                  values: ['\'', '\"', '\`'],
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
                resetCurrentInstance('Cannot find emit event')
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
                  values: terminator,
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
                resetCurrentInstance('Cannot find refs name')
              }
            } else if (key) {
              resetCurrentInstance(`Unknown source: ${key}`)
            } else {
              contents[i] = options.separator ? content.replace(key, `${options.separator}${key}`) : `${content}`
            }
          }
        }
        result = contents.join('')
        return result
      },
      addImport(type: string, value: string): void {
        if (
          getPrototype(type) !== 'string' ||
          getPrototype(value) !== 'string' ||
          !['vue', 'vue-router', 'vuex'].includes(type)
        ) {
          return
        }
        const importContent: string[] = vmContent.import[type]
        if (!importContent?.includes(value)) {
          importContent.push(value)
        }
      },
      addUse(type: string): void {
        if (
          getPrototype(type) !== 'string' ||
          !['data', 'vm', 'attrs', 'slots', 'router', 'route', 'store'].includes(type)
        ) {
          return
        }
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

    // vm set content methods runing
    for (const prop in vmSetContentMethods) {
      const vmSetContentMethod: Function = vmSetContentMethods[prop as keyof VmSetContentMethods]
      if (getPrototype(vmSetContentMethod).indexOf('function') !== -1) {
        vmSetContentMethod()
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

export default Vue2ToCompositionApi
