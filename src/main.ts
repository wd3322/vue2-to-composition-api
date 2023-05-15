/*
* package: vue2-to-composition-api
* e-mail: diquick@qq.com
* author: wd3322
*/

declare global {
  interface Window {
    Vue2ToCompositionApiVmBody: any,
    require: any
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
  getContentStr: Function,
  replaceKey: Function,
  replaceValue: Function,
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
      eol: '\n',
      brace_style: 'collapse-preserve-inline'
    }

    // reg-exp init
    const braceRegExp: RegExp = /\{[\s\S]*\}/g
    const parenthesisRegExp: RegExp = /\((.*)\)/g

    // vm body init
    window.Vue2ToCompositionApiVmBody = {}
    window.require = function() {}
    const beautifyScriptContent: string = jsBeautify(entryScriptContent, jsBeautifyOptions)
    const modelScriptContent: string | undefined = (function() {
      const componentsRegExp: RegExp = /components: ((\{\})|(\{[\s\S]+?\}))[\,\n]/
      const mixinsRegExp: RegExp = /mixins: ((\[\])|(\[([\s\S]+?)\]))[\,\n]/
      return beautifyScriptContent
        .match(braceRegExp)?.[0]
        .replace(componentsRegExp, '')
        .replace(mixinsRegExp, '')
    })()
    if (modelScriptContent) {
      eval(`window.Vue2ToCompositionApiVmBody = ${modelScriptContent}`)
    } else {
      throw new Error(`Vue2ToCompositionApi entry script content not a valid content`)
    }
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
        if (vmKeys.props.length > 0) {
          const propsContentStr: string = utilMethods.getContentStr(vmContent.props, null, {
            function: (params: any) => {
              const { type, content } = params
              if (type === 'custom') {
                return content
              }
            }
          })
          if (propsContentStr) {
            vmOutput.props = `const props = defineProps(${propsContentStr})`
          }
        }
      },
      data(): void {
        if (vmKeys.data.length > 0) {
          const dataFunctionStr: string = utilMethods.getContentStr(vmContent.data, true, {
            function: (params: any) => {
              const { type, body } = params
              if (type === 'custom') {
                return body
              }
            }
          })
          if (dataFunctionStr) {
            const dataContentRegExp: RegExp = /return ([\s\S]*)\}/
            const dataContentStr: string = dataFunctionStr.match(dataContentRegExp)?.[1] || '{}'
            vmOutput.data = `const data = reactive(${dataContentStr})`
            utilMethods.addImport('vue', 'reactive')
          }
        }
      },
      computed(): void {
        if (vmKeys.computed.length > 0) {
          const computedValues: string[] = []
          for (const prop in vmContent.computed) {
            const computedContent: any = vmContent.computed[prop]
            if (
              computedContent &&
              ['object', 'function', 'asyncfunction'].includes(getPrototype(computedContent))
            ) {
              const computedName: string = getPrototype(computedContent).indexOf('function') !== -1 ? computedContent.name : prop
              const computedFunctionStr: string = utilMethods.getContentStr(computedContent)
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
        if (vmKeys.watch.length > 0) {
          const watchValues: string[] = []
          for (const prop in vmContent.watch) {
            const watchContent: any = vmContent.watch[prop]
            if (getPrototype(watchContent).indexOf('function') !== -1) {
              const watchName: string = utilMethods.replaceKey(watchContent.name)
              const watchFunctionStr: string = utilMethods.getContentStr(watchContent)
              if (watchName && watchFunctionStr) {
                watchValues.push(`watch(() => ${watchName}, ${watchFunctionStr})`)
              }
            } else if (
              watchContent &&
              getPrototype(watchContent) === 'object' &&
              getPrototype(watchContent.handler).indexOf('function') !== -1
            ) {
              const watchName: string = utilMethods.replaceKey(prop)
              const watchFunctionStr: string = utilMethods.getContentStr(watchContent.handler)
              const watchOptionsStr: string = utilMethods.getContentStr(watchContent, null, {
                object: (params: any) => {
                  const { value, values } = params
                  if (value.handler) {
                    const index = values.findIndex((item: string) => /^handler\:/.test(item))
                    values.splice(index, 1)
                  }
                  return values.length > 0 ? `{\n${values.join(',\n')}\n}` : '{}'
                }
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
        if (vmKeys.hooks.length === 0) {
          const hookValues: string[] = []
          for (const prop in vmContent.hooks) {
            const hookContent: any = vmContent.hooks[prop]
            if (getPrototype(hookContent).indexOf('function') !== -1) {
              if (['beforeCreate', 'created'].includes(hookContent.name)) {
                const hookName: string = `on${hookContent.name.substring(0, 1).toUpperCase()}${hookContent.name.substring(1)}`
                const hookFunctionStr: string = utilMethods.getContentStr(hookContent, null, {
                  function: (params: any) => {
                    const { type, value, arg, body } = params
                    if (type === 'custom') {
                      return value.constructor.name === 'AsyncFunction'
                        ? `async function ${hookName} ${arg} ${body}\n${hookName}()`
                        : `function ${hookName} ${arg} ${body}\n${hookName}()`
                    }
                  }
                })
                if (hookName && hookFunctionStr) {
                  hookValues.push(hookFunctionStr)
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
                const hookFunctionStr: string = utilMethods.getContentStr(hookContent, null, {
                  function: (params: any) => {
                    const { type, value, arg, body } = params
                    if (type === 'custom') {
                      return value.constructor.name === 'AsyncFunction'
                        ? `${hookName} (async ${arg} => ${body})`
                        : `${hookName} (${arg} => ${body})`
                    }
                  }
                })
                if (hookName && hookFunctionStr) {
                  hookValues.push(hookFunctionStr)
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
        if (vmKeys.methods.length > 0) {
          const methodValues: string[] = []
          for (const prop in vmContent.methods) {
            const methodContent: any = vmContent.methods[prop]
            if (getPrototype(methodContent).indexOf('function') !== -1) {
              const methodName: string = methodContent.name
              const methodFunctionStr: string = utilMethods.getContentStr(methodContent, null, {
                function: (params: any) => {
                  const { type, value, arg, body } = params
                  if (type === 'custom') {
                    return value.constructor.name === 'AsyncFunction'
                      ? `async function ${methodName} ${arg} ${body}`
                      : `function ${methodName} ${arg} ${body}`
                  }
                }
              })
              if (methodName && methodFunctionStr) {
                methodValues.push(methodFunctionStr)
              }
            }
          }
          if (methodValues.length > 0) {
            vmOutput.methods = methodValues.join('\n\n')
          }
        }
      },
      filters(): void {
        if (vmKeys.filters.length > 0) {
          const filterValues: string[] = []
          for (const prop in vmContent.filters) {
            const filterContent: any = vmContent.filters[prop]
            if (getPrototype(filterContent).indexOf('function') !== -1) {
              const filterName: string = filterContent.name
              const filterFunctionStr: string = utilMethods.getContentStr(filterContent, null, {
                function: (params: any) => {
                  const { type, value, arg, body } = params
                  if (type === 'custom') {
                    return value.constructor.name === 'AsyncFunction'
                      ? `async function ${filterName} ${arg} ${body}`
                      : `function ${filterName} ${arg} ${body}`
                  }
                }
              })
              if (filterName && filterFunctionStr) {
                filterValues.push(filterFunctionStr)
              }
            }
          }
          if (filterValues.length > 0) {
            vmOutput.filters = filterValues.join('\n\n')
          }
        }
      },
      emits(): void {
        if (vmContent.emits.length > 0) {
          const emitValues: string[] = []
          for (const emit of vmContent.emits) {
            if (emit) {
              emitValues.push(`\'${emit}\'`)
            }
          }
          if (emitValues.length > 0) {
            vmOutput.emits = `const emit = defineEmits([${emitValues.join(', ')}])`
          }
        }
      },
      refs(): void {
        if (vmContent.refs.length > 0) {
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
        if (vmKeys.use().length > 0) {
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
        if (vmKeys.import().length > 0) {
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
      getContentStr(
        value: any,
        replaceDataKeyToUseData: boolean = false,
        resultCallbackContent: {
          string?: Function,
          object?: Function,
          array?: Function,
          function?: Function,
          other?: Function,
        } = {
          string: undefined,
          object: undefined,
          array: undefined,
          function: undefined,
          other: undefined
        }
      ): string | undefined {
        let result: string = ''
        // string prototype
        if (getPrototype(value) === 'string') {
          result = `\'${value}\'`
          if (resultCallbackContent.string) {
            result = resultCallbackContent.string({ value, result })
          }
        }
        // object prototype
        else if (getPrototype(value) === 'object') {
          const values: string[] = []
          for (const prop in value) {
            const content: string = utilMethods.getContentStr(value[prop], replaceDataKeyToUseData, resultCallbackContent)
            values.push(`${prop}: ${content}`)
          }
          result = values.length > 0 ? `{\n${values.join(',\n')}\n}` : '{}'
          if (resultCallbackContent.object) {
            result = resultCallbackContent.object({ value, values, result }) || result
          }
        }
        // array prototype
        else if (getPrototype(value) === 'array') {
          const values: string[] = []
          for (const item of value) {
            const content: string = utilMethods.getContentStr(item, replaceDataKeyToUseData, resultCallbackContent)
            values.push(content)
          }
          result = values.length > 0 ? `[${values.join(', ')}]` : '[]'
          if (resultCallbackContent.array) {
            result = resultCallbackContent.array({ value, values, result }) || result
          }
        }
        // function prototype
        else if (getPrototype(value).indexOf('function') !== -1) {
          let content: string = value.toString()
          // native code
          if (
            ['String', 'Number', 'Boolean', 'Array', 'Object', 'Date', 'Function', 'Symbol'].includes(value.name) &&
            content.match(braceRegExp)?.[0] === '{ [native code] }'
          ) {
            result = `${value.name}`
            if (resultCallbackContent.function) {
              result = resultCallbackContent.function({ type: 'native', value, content, result }) || result
            }
          }
          // custom code
          else {
            content = utilMethods.replaceValue(content, replaceDataKeyToUseData)
            const arg: string = content.match(parenthesisRegExp)?.[0] || '()'
            const body: string = content.substring(content.indexOf(arg) + arg.length).match(braceRegExp)?.[0] || '{}'
            result = value.constructor.name === 'AsyncFunction'
              ? `async ${arg} => ${body}`
              : `${arg} => ${body}`
            if (resultCallbackContent.function) {
              result = resultCallbackContent.function({ type: 'custom', value, content, arg, body, result }) || result
            }
          }
        }
        // other prototype
        else {
          result = `${value}`
          if (resultCallbackContent.other) {
            result = resultCallbackContent.other({ value, result }) || result
          }
        }
        return result
      },
      replaceKey(key: string, dataKeyToUseData: boolean = false): string | void {
        let result: string = ''
        // props key
        if (vmKeys.props.includes(key)) {
          result = 'props.' + key
        }
        // computed key
        else if (vmKeys.computed.includes(key)) {
          result = key + '.value'
        }
        // methods key
        else if (vmKeys.methods.includes(key)) {
          result = key
        }
        // data key
        else if (vmKeys.data.includes(key) && !dataKeyToUseData) {
          result = 'data.' + key
        }
        // useData key
        else if (vmKeys.data.includes(key) && dataKeyToUseData) {
          utilMethods.addUse('data')
          result = 'useData().' + key
        }
        // unknown key
        else if (key) {
          utilMethods.addImport('vue', 'getCurrentInstance')
          utilMethods.addUse('vm')
          result = `/* Warn: Unknown source: ${key} */ $vm.${key}`
        }
        return result
      },
      replaceValue(value: string, dataKeyToUseData: boolean = false): string {
        let result: string = ''
        const thisKeyRegExp: RegExp = /this(\.{1})([$a-zA-Z0-9_]+)/g
        const refKeyRegExp: RegExp = /\$REFS_KEY(\.|\?\.)([$a-zA-Z0-9_]+)/g
        result = value
          .replace(thisKeyRegExp, function(
            str: string,
            separator: string,
            key: string,
            index: number,
            content: string
          ): string {
            // props key
            if (vmKeys.props.includes(key)) {
              return 'props.' + key
            }
            // computed key
            else if (vmKeys.computed.includes(key)) {
              return key + '.value'
            }
            // methods key
            else if (vmKeys.methods.includes(key)) {
              return key
            }
            // data key
            else if (vmKeys.data.includes(key) && !dataKeyToUseData) {
              return 'data.' + key
            }
            // useData key
            else if (vmKeys.data.includes(key) && dataKeyToUseData) {
              utilMethods.addUse('data')
              return 'useData().' + key
            }
            // attrs key
            else if (key === '$attrs') {
              utilMethods.addImport('vue', 'useAttrs')
              utilMethods.addUse('attrs')
              return key.substring(1)
            }
            // slots key
            else if (key === '$slots') {
              utilMethods.addImport('vue', 'useSlots')
              utilMethods.addUse('slots')
              return key.substring(1)
            }
            // router key
            else if (key === '$router') {
              utilMethods.addImport('vue-router', 'useRouter')
              utilMethods.addUse('router')
              return key.substring(1)
            }
            // route key
            else if (key === '$route') {
              utilMethods.addImport('vue-router', 'useRoute')
              utilMethods.addUse('route')
              return key.substring(1)
            }
            // store key
            else if (key === '$store') {
              utilMethods.addImport('vuex', 'useStore')
              utilMethods.addUse('store')
              return key.substring(1)
            }
            // nextTick key
            else if (key === '$nextTick') {
              utilMethods.addImport('vue', 'nextTick')
              return key.substring(1)
            }
            // set key
            else if (key === '$set') {
              utilMethods.addImport('vue', 'set')
              return key.substring(1)
            }
            // delete key
            else if (key === '$delete') {
              utilMethods.addImport('vue', 'del')
              return key.substring(1)
            }
            // emit key
            else if (key === '$emit') {
              const nameRegExp: RegExp = /^\([\'\"\`](update:){0,1}([$a-zA-Z0-9_-]+)[\'\"\`]/
              const name: string = content.substring(index + str.length).match(nameRegExp)?.[2] || ''
              if (name) {
                !vmContent.emits.includes(name) && vmContent.emits.push(name)
              } else {
                utilMethods.addImport('vue', 'getCurrentInstance')
                utilMethods.addUse('vm')
              }
              return name
                ? key.substring(1)
                : `/* Warn: Cannot find emit name */ $vm.$emit`
            }
            // refs key
            else if (key === '$refs') {
              const nameRegExp: RegExp = /(^\.|^\?\.)([$a-zA-Z0-9_]+)/
              const name: string = content.substring(index + str.length).match(nameRegExp)?.[2] || ''
              if (name) {
                !vmContent.refs.includes(name) && vmContent.refs.push(name)
              } else {
                utilMethods.addImport('vue', 'getCurrentInstance')
                utilMethods.addUse('vm')
              }
              return name
                ? '$REFS_KEY'
                : `/* Warn: Cannot find refs name */ $vm.$refs`
            }
            // other key
            else if (
              ['$data', '$props', '$el', '$options', '$parent', '$root', '$children', '$isServer',
                '$listeners', '$watch', '$on', '$once', '$off', '$mount', '$forceUpdate', '$destroy'].includes(key)
            ) {
              utilMethods.addImport('vue', 'getCurrentInstance')
              utilMethods.addUse('vm')
              return '$vm.' + key
            }
            // unknown key
            else if (key) {
              utilMethods.addImport('vue', 'getCurrentInstance')
              utilMethods.addUse('vm')
              return `/* Warn: Unknown source: ${key} */ $vm.${key}`
            }
            // nonexistent key
            else {
              utilMethods.addImport('vue', 'getCurrentInstance')
              utilMethods.addUse('vm')
              return `/* Warn: Cannot find key */ $vm${separator}`
            }
          })
          .replace(refKeyRegExp, function(
            str: string,
            separator: string,
            name: string
          ): string {
            // reset refs key
            return name + '.value'
          })        
        return result
      },
      addImport(type: string, value: string): void {
        if (['vue', 'vue-router', 'vuex'].includes(type)) {
          const importContent: string[] = vmContent.import[type]
          if (!importContent?.includes(value)) {
            importContent.push(value)
          }
        }
      },
      addUse(type: string): void {
        if (['data', 'vm', 'attrs', 'slots', 'router', 'route', 'store'].includes(type)) {
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
