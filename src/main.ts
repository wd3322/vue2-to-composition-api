/*
* package: vue2-to-composition-api
* e-mail: diquick@qq.com
* author: wd3322
*/

declare global {
  interface Window { Vue2ToCompositionApiVmBody: any }
}

function Vue2ToCompositionApi(entrySrciptContent: string = '', options: { isDebug: boolean } = { isDebug: false }): any {
  if (typeof entrySrciptContent === 'string' && typeof options === 'object') {
    try {
      // output srcipt content init
      let outputSrciptContent: string = ''

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
      const scriptContent: string = jsBeautify(entrySrciptContent, jsBeautifyOptions)
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
        lifeCycle: {},
        import: { vue: [], 'vue-router': [], vuex: [] },
        use: {},
        emits: [],
        refs: []
      }

      // vm lifeCycle content init
      for (const prop in vmBody) {
        if (
          (['beforeCreate', 'created', 'beforeMount', 'mounted',
            'beforeUpdate', 'updated', 'beforeDestroy', 'destroyed',
            'activated', 'deactivated', 'errorCaptured'].includes(prop)
          ) && typeof vmBody[prop] === 'function') {
          vmContent.lifeCycle[prop] = vmBody[prop]
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
        lifeCycle: Object.keys(vmContent.lifeCycle),
        import: () => Object.keys(vmContent.import),
        use: () => Object.keys(vmContent.use)
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
        lifeCycle: '',
        methods: '',
        filters: ''
      }

      // vm set content methods init
      const vmSetContentMethods: any = {
        porps(): void {
          if (vmContent.props instanceof Array) {
            const propsContentStr: string = utilMethods.getPropsStr(vmContent.props)
            vmOutput.props = `const props = defineProps(${propsContentStr})`
          } else if (typeof vmContent.props === 'object' && vmContent.props !== null) {
            for (const prop in vmContent.props) {
              const propsContent: any = vmContent.props[prop]
              const propsContentStr: string = utilMethods.getPropsStr(propsContent)
              vmOutput.props = vmOutput.props.concat(`${prop}: ${propsContentStr},\n`)
            }
            if (vmKeys.props.length > 0) {
              vmOutput.props = `const props = defineProps({\n${vmOutput.props.substring(0, vmOutput.props.length - 2)}\n})`
            }
          }
        },
        data(): void {
          const dataFunctionStr: { body: string } = utilMethods.getFunctionStr(vmBody.data, { useData: true })
          const dataContentStr: string = dataFunctionStr.body.substring(dataFunctionStr.body.indexOf('return {') + 9, dataFunctionStr.body.length - 7)
          if (vmKeys.data.length > 0) {
            vmOutput.data = `const data = reactive({\n${dataContentStr.substring(0, dataContentStr.length)}\n})`
            utilMethods.addImport('vue', 'reactive')
          }
        },
        computed(): void {
          for (const prop in vmContent.computed) {
            const computedContent: any = vmContent.computed[prop]
            if (typeof computedContent === 'function') {
              const computedFunctionStr: { arg: string, body: string } = utilMethods.getFunctionStr(computedContent)
              vmOutput.computed = vmOutput.computed.concat(
                `const ${computedContent.name} = computed((${computedFunctionStr.arg}) => ${computedFunctionStr.body})\n\n`
              )
            } else if (typeof computedContent === 'object' && computedContent !== null) {
              let computedContentStr: string = ''
              let computedGetStr: string = ''
              let computedSetStr: string = ''
              if (typeof computedContent.get === 'function') {
                const computedFunctionStr: { arg: string, body: string } = utilMethods.getFunctionStr(computedContent.get)
                computedGetStr = `get: (${computedFunctionStr.arg}) => ${computedFunctionStr.body},\n`
              }
              if (typeof computedContent.set === 'function') {
                const computedFunctionStr: { arg: string, body: string } = utilMethods.getFunctionStr(computedContent.set)
                computedSetStr = `set: (${computedFunctionStr.arg}) => ${computedFunctionStr.body},\n`
              }
              computedContentStr = `${computedGetStr}${computedSetStr}`
              vmOutput.computed = vmOutput.computed.concat(
                `const ${prop} = computed({\n${computedContentStr.substring(0, computedContentStr.length - 2)}})\n\n`
              )
            }
          }
          if (vmKeys.computed.length > 0) {
            vmOutput.computed = vmOutput.computed.substring(0, vmOutput.computed.length - 2)
            utilMethods.addImport('vue', 'computed')
          }
        },
        watch(): void {
          for (const prop in vmContent.watch) {
            const watchContent: any = vmContent.watch[prop]
            if (typeof watchContent === 'function') {
              const watchFunctionStr: { arg: string, body: string } = utilMethods.getFunctionStr(watchContent)
              const watchContentName: string =
                vmKeys.props.some((key: string) => key === watchContent.name)
                  ? `props.${watchContent.name}`
                  : vmKeys.data.some((key: string) => key === watchContent.name)
                    ? `data.${watchContent.name}`
                    : vmKeys.computed.some((key: string) => key === watchContent.name)
                      ? `${watchContent.name}.value`
                      : prop
              if (watchContentName) {
                vmOutput.watch = vmOutput.watch.concat(
                  `watch(() => ${watchContentName}, (${watchFunctionStr.arg}) => ${watchFunctionStr.body})\n\n`
                )
              }
            } else if (typeof watchContent === 'object' && watchContent !== null && typeof watchContent.handler === 'function') {
              const watchFunctionStr: { arg: string, body: string } = utilMethods.getFunctionStr(watchContent.handler)
              const watchOptionsStr: string = utilMethods.getObjectStr(watchContent, { objExcludeProps: ['handler'] })
              const watchContentName: string  =
                vmKeys.props.some((key: string) => key === prop)
                  ? `props.${prop}`
                  : vmKeys.data.some((key: string) => key === prop)
                    ? `data.${prop}`
                    : vmKeys.computed.some((key: string) => key === prop)
                      ? `${vmKeys.computed}.value`
                      : prop
              if (watchContentName) {
                vmOutput.watch = watchOptionsStr !== '{}'
                  ? vmOutput.watch.concat(
                    `watch(() => ${watchContentName}, (${watchFunctionStr.arg}) => ${watchFunctionStr.body}, ${watchOptionsStr})\n\n`
                  )
                  : vmOutput.watch.concat(
                    `watch(() => ${watchContentName}, (${watchFunctionStr.arg}) => ${watchFunctionStr.body})\n\n`
                  )
              }
            }
          }
          if (vmKeys.watch.length > 0) {
            vmOutput.watch = vmOutput.watch.substring(0, vmOutput.watch.length - 2)
            utilMethods.addImport('vue', 'watch')
          }
        },
        lifeCycle(): void {
          for (const prop in vmContent.lifeCycle) {
            const lifeCycleContent: any = vmContent.lifeCycle[prop]
            if (typeof lifeCycleContent === 'function') {
              const lifeCycleContentName: string = `on${lifeCycleContent.name.substring(0, 1).toUpperCase()}${lifeCycleContent.name.substring(1)}`
              const lifeCycleFunctionStr: { arg: string, body: string } = utilMethods.getFunctionStr(lifeCycleContent)
              if (['beforeCreate', 'created'].includes(lifeCycleContent.name)) {
                vmOutput.lifeCycle = vmOutput.lifeCycle.concat(
                  lifeCycleContent.constructor.name === 'AsyncFunction'
                    ? `async function ${lifeCycleContentName} (${lifeCycleFunctionStr.arg})\n${lifeCycleFunctionStr.body}\n${lifeCycleContentName}()\n\n`
                    : `function ${lifeCycleContentName} (${lifeCycleFunctionStr.arg})\n${lifeCycleFunctionStr.body}\n${lifeCycleContentName}()\n\n`
                )
              } else if (
                ['beforeMount', 'mounted', 'beforeUpdate', 'updated', 'beforeDestroy', 'destroyed', 'deactivated', 'errorCaptured'].includes(lifeCycleContent.name)
              ) {
                const v3LifeCycleNameDist: any = {
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
                const v3LifeCycleName: string = v3LifeCycleNameDist[lifeCycleContent.name as string]
                if (v3LifeCycleName) {
                  vmOutput.lifeCycle = vmOutput.lifeCycle.concat(
                    lifeCycleContent.constructor.name === 'AsyncFunction'
                      ? `${v3LifeCycleName} (async(${lifeCycleFunctionStr.arg}) => ${lifeCycleFunctionStr.body})\n\n`
                      : `${v3LifeCycleName} ((${lifeCycleFunctionStr.arg}) => ${lifeCycleFunctionStr.body})\n\n`
                  )
                  utilMethods.addImport('vue', v3LifeCycleName)
                }
              }
            }
          }
          if (vmKeys.lifeCycle.length > 0) {
            vmOutput.lifeCycle = vmOutput.lifeCycle.substring(0, vmOutput.lifeCycle.length - 2)
          }
        },
        methods(): void {
          for (const prop in vmContent.methods) {
            const methodsContent: any = vmContent.methods[prop]
            if (typeof methodsContent === 'function') {
              const methodsFunctionStr: { arg: string, body: string } = utilMethods.getFunctionStr(methodsContent)
              vmOutput.methods = vmOutput.methods.concat(
                methodsContent.constructor.name === 'AsyncFunction'
                  ? `async function ${methodsContent.name} (${methodsFunctionStr.arg})\n${methodsFunctionStr.body}\n\n`
                  : `function ${methodsContent.name} (${methodsFunctionStr.arg})\n${methodsFunctionStr.body}\n\n`
              )
            }
          }
          if (vmKeys.methods.length > 0) {
            vmOutput.methods = vmOutput.methods.substring(0, vmOutput.methods.length - 2)
          }
        },
        filters(): void {
          for (const prop in vmContent.filters) {
            const filtersContent: any = vmContent.filters[prop]
            if (typeof filtersContent === 'function') {
              const filtersFunctionStr: { arg: string, body: string } = utilMethods.getFunctionStr(filtersContent)
              vmOutput.filters = vmOutput.filters.concat(
                `function ${filtersContent.name} (${filtersFunctionStr.arg})\n${filtersFunctionStr.body}\n\n`
              )
            }
          }
          if (vmKeys.filters.length > 0) {
            vmOutput.filters = vmOutput.filters.substring(0, vmOutput.filters.length - 2)
          }
        },
        import(): void {
          for (const prop in vmContent.import) {
            const importContent: string[] = vmContent.import[prop]
            if (importContent.length > 0) {
              vmOutput.import = vmOutput.import.concat(`import { ${importContent.join(', ')} } from '${prop}'\n`)
            }
          }
          if (vmKeys.import().length > 0) {
            vmOutput.import = vmOutput.import.substring(0, vmOutput.import.length - 1)
          }
        },
        use(): void {
          for (const prop in vmContent.use) {
            const useContent: string = vmContent.use[prop]
            vmOutput.use = vmOutput.use.concat(`${useContent}\n`)
          }
          if (vmKeys.use().length > 0) {
            vmOutput.use = vmOutput.use.substring(0, vmOutput.use.length - 1)
          }
        },
        emits(): void {
          for (const emits of vmContent.emits) {
            const emitsContent: string = emits.split('update:').pop()
            vmOutput.emits = vmOutput.emits.concat(`'${emitsContent}', `)
          }
          if (vmContent.emits.length > 0) {
            vmOutput.emits = `const emit = defineEmits([${vmOutput.emits.substring(0, vmOutput.emits.length - 2)}])`
          }
        },
        refs(): void {
          for (const refs of vmContent.refs) {
            vmOutput.refs = vmOutput.refs.concat(`const ${refs} = ref(null)\n`)
          }
          if (vmContent.refs.length > 0) {
            vmOutput.refs = vmOutput.refs.substring(0, vmOutput.refs.length - 1)
          }
        },
        output(): void {
          for (const prop in vmOutput) {
            const vmOutputContent: string = vmOutput[prop]
            if (vmOutputContent) {
              outputSrciptContent = outputSrciptContent.concat(`${vmOutputContent}\n\n`)
            }
          }
        }
      }

      // util methods init
      const utilMethods = {
        getIndexArr({ values = [], content = '', start = 0, append = false }: { values: string[], content: string, start: number, append: boolean }): number[] {
          const result: number[] = []
          if (values instanceof Array && typeof content === 'string') {
            for (const value of values) {
              const valueIndex: number = content.indexOf(value, start)
              if (valueIndex !== -1) {
                result.push(append ? valueIndex + (+value.length) : valueIndex)
              }
            }
          }
          return result
        },
        getObjectStr(value: any, options: { objExcludeProps: string[] } = { objExcludeProps: [] }): string {
          let result: string = ''
          if (typeof value === 'function') {
            result = utilMethods.getFunctionStr(value).main
          } else if (value instanceof Array) {
            for (const item of value) {
              result = result.concat(`${utilMethods.getObjectStr(item)}, `)
            }
            result = `[${result.substring(0, result.length - 2)}]`
          } else if (typeof value === 'object' && value !== null) {
            const valueKeys: string[] = []
            for (const prop in value) {
              if (!options.objExcludeProps.includes(prop)) {
                result = result.concat(`${prop}: ${utilMethods.getObjectStr(value[prop])},\n`)
                valueKeys.push(prop)
              }
            }
            result = valueKeys.length > 0 ? `{\n${result.substring(0, result.length - 2)}\n}` : '{}'
          } else if (typeof value === 'string') {
            result = `'${value}'`
          } else {
            result = `${value}`
          }
          return result
        },
        getFunctionStr(value: any, options: any = {}): { main: string, arg: string, body: string } {
          let result: any = {}
          let mainStr: string = ''
          let argStr: string = ''
          let bodyStr: string = ''
          if (typeof value === 'function') {
            mainStr = utilMethods.replaceKey(value.toString(), options)
            argStr = mainStr.substring(
              mainStr.indexOf('(') + 1,
              Math.min(
                ...utilMethods.getIndexArr({
                  values: [') {', ') =>'],
                  content: mainStr,
                  start: 0,
                  append: false
                })
              )
            )
            bodyStr = mainStr.substring(
              Math.min(
                ...utilMethods.getIndexArr({
                  values: [') {', '=> {'],
                  content: mainStr,
                  start: 0,
                  append: true
                })
              ) - 1,
              mainStr.length
            )
          }
          result = { main: mainStr, arg: argStr, body: bodyStr }
          return result
        },
        getPropsStr(value: any, options: { functionToString: boolean } = { functionToString: false }): string {
          let result: string = ''
          if (typeof value === 'function' && !options.functionToString) {
            result = `${value.name}`
          } else if (value instanceof Array) {
            for (const item of value) {
              result = result.concat(`${utilMethods.getPropsStr(item)}, `)
            }
            result = `[${result.substring(0, result.length - 2)}]`
          } else if (typeof value === 'object' && value !== null) {
            for (const prop in value) {
              result = result.concat(`${prop}: ${utilMethods.getPropsStr(value[prop], {
                functionToString: ['default', 'validator'].includes(prop)
              })},\n`)
            }
            result = Object.keys(value).length > 0 ? `{\n${result.substring(0, result.length - 2)}\n}` : '{}'
          } else if (typeof value === 'string') {
            result = `'${value}'`
          } else {
            result = `${value}`
          }
          return result
        },
        replaceKey(value: string, options: { useData: boolean } = { useData: false }): string {
          let result: string = ''
          if (typeof value === 'string') {
            const contentArr: string[] = value.split('this.')
            if (contentArr.length > 0) {
              for (let i = 0; i < contentArr.length; i++) {
                const content: string = contentArr[i]
                const key: string = content.substring(0, Math.min(
                  ...utilMethods.getIndexArr({
                    values: ['\n', '\t', ' ', '.', ',', '?', '[', ']', ')', '(', '+', '-'],
                    content,
                    start: 0,
                    append: false
                  })
                ))
                const reset = () => {
                  contentArr[i] = content.replace(key, `this.${key}`)
                }
                if (vmKeys.props.includes(key)) {
                  contentArr[i] = content.replace(key, `props.${key}`)
                } else if (vmKeys.data.includes(key) && options.useData) {
                  contentArr[i] = content.replace(key, `useData().${key}`)
                  utilMethods.addUse('data')
                } else if (vmKeys.data.includes(key)) {
                  contentArr[i] = content.replace(key, `data.${key}`)
                } else if (vmKeys.computed.includes(key)) {
                  contentArr[i] = content.replace(key, `${key}.value`)
                } else if (vmKeys.methods.includes(key)) {
                  contentArr[i] = content
                } else if ([  
                  '$data', '$props', '$el', '$options', '$parent', '$root', '$children', '$isServer',
                  '$listeners', '$watch', '$on', '$once', '$off', '$mount', '$forceUpdate', '$destroy'].includes(key)
                ) {
                  contentArr[i] = content.replace(key, `$vm.proxy.${key}`)
                  utilMethods.addImport('vue', 'getCurrentInstance')
                  utilMethods.addUse('vm')
                } else if ([
                  '$attrs', '$slots', '$router', '$route', '$store', '$nextTick', '$set', '$delete'].includes(key)
                ) {
                  contentArr[i] = content.replace('$', '')
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
                    contentArr[i] = contentArr[i].replace('delete', 'del')
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
                    contentArr[i] = content.replace('$', '')
                  } else {
                    reset()
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
                    contentArr[i] = `${refsName}.value${content.substring(content.indexOf(refsName) + refsName.length, content.length)}`
                    utilMethods.addImport('vue', 'ref')
                  } else {
                    reset()
                  }
                } else {
                  reset()
                }
              }
            }
            result = contentArr.join('')
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
              vm: 'const $vm = getCurrentInstance()',
              data: 'const useData = () => data',
              attrs: 'const attrs = useAttrs()',
              slots: 'const slots = useSlots()',
              router: 'const router = useRouter()',
              route: 'const route = useRoute()',
              store: 'const store = useStore()'
            }
            vmContent.use[type] = contentDist[type]
          }
        }
      }

      // vm set content methods runing
      for (const prop in vmSetContentMethods) {
        if (typeof vmSetContentMethods[prop] === 'function') {
          vmSetContentMethods[prop]()
        }
      }

      // output srcipt content beautify
      outputSrciptContent = jsBeautify(outputSrciptContent, jsBeautifyOptions)

      // debug console log
      if (options.isDebug) {
        console.log('Vue2ToCompositionApi', {
          entrySrciptContent,
          outputSrciptContent,
          vmBody,
          vmContent,
          vmOutput,
          vmKeys
        })
      }

      // done
      return outputSrciptContent
    } catch (err: any) {
      throw new Error(err)
    }
  }
}

export default Vue2ToCompositionApi
