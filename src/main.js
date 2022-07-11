
/*
* package: vue2-to-composition-api
* e-mail: diquick@qq.com
* author: wd3322
*/

const Vue2ToCompositionApi = (entrySrciptContent = '', options = {}) => {
  if (typeof entrySrciptContent === 'string' && typeof options === 'object') {
    try {
      // output srcipt content init
      let outputSrciptContent = ''

      // js-beautify init
      const jsBeautify = require('js-beautify')
      const jsBeautifyOptions = {
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
      let vmBody
      const scriptContent = jsBeautify(entrySrciptContent, jsBeautifyOptions)
      eval(scriptContent.replace('export default', 'vmBody ='))

      // vm content init
      const vmContent = {
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
      const vmKeys = {
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
      const vmOutput = {
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
      const vmSetContentMethods = {
        porps: () => {
          if (vmContent.props instanceof Array) {
            vmOutput.props = `const props = defineProps(${utilMethods.getPropsStr(vmContent.props)})`
          } else if (typeof vmContent.props === 'object' && vmContent.props !== null) {
            for (const prop in vmContent.props) {
              const propsContent = vmContent.props[prop]
              vmOutput.props = vmOutput.props.concat(`${prop}: ${utilMethods.getPropsStr(propsContent)},\n`)
            }
            if (vmKeys.props.length > 0) {
              vmOutput.props = `const props = defineProps({\n${vmOutput.props.substring(0, vmOutput.props.length - 2)}\n})`
            }
          }
        },
        data: () => {
          const dataFunctionStr = utilMethods.getFunctionStr(vmBody.data, { useData: true })
          vmOutput.data = dataFunctionStr.body.substring(dataFunctionStr.body.indexOf('return {') + 9, dataFunctionStr.body.length - 5)
          if (vmKeys.data.length > 0) {
            vmOutput.data = `const data = reactive({\n${vmOutput.data.substring(0, vmOutput.data.length - 2)}\n})`
            utilMethods.addImport('vue', 'reactive')
          }
        },
        computed: () => {
          for (const prop in vmContent.computed) {
            const computedContent = vmContent.computed[prop]
            if (typeof computedContent === 'function') {
              const computedFunctionStr = utilMethods.getFunctionStr(computedContent)
              vmOutput.computed = vmOutput.computed.concat(
                `const ${computedContent.name} = computed((${computedFunctionStr.arg}) => ${computedFunctionStr.body})\n\n`
              )
            } else if (typeof computedContent === 'object' && computedContent !== null) {
              let computedContentStr = ''
              let computedGetStr = ''
              let computedSetStr = ''
              if (typeof computedContent.get === 'function') {
                const computedFunctionStr = utilMethods.getFunctionStr(computedContent.get)
                computedGetStr = `get: (${computedFunctionStr.arg}) => ${computedFunctionStr.body},\n`
              }
              if (typeof computedContent.set === 'function') {
                const computedFunctionStr = utilMethods.getFunctionStr(computedContent.set)
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
        watch: () => {
          for (const prop in vmContent.watch) {
            const watchContent = vmContent.watch[prop]
            if (typeof watchContent === 'function') {
              const watchFunctionStr = utilMethods.getFunctionStr(watchContent)
              const watchContentName =
                vmKeys.props.some(key => key === watchContent.name)
                  ? `props.${watchContent.name}`
                  : vmKeys.data.some(key => key === watchContent.name)
                    ? `data.${watchContent.name}`
                    : vmKeys.computed.some(key => key === watchContent.name)
                      ? `${watchContent.name}.value` : ''
              vmOutput.watch = vmOutput.watch.concat(
                `watch(() => ${watchContentName}, (${watchFunctionStr.arg}) => ${watchFunctionStr.body})\n\n`
              )
            } else if (typeof watchContent === 'object' && typeof watchContent.handler === 'function') {
              const watchFunctionStr = utilMethods.getFunctionStr(watchContent.handler)
              const watchOptionsStr = utilMethods.getObjectStr(watchContent, ['handler'])
              const watchContentName =
                vmKeys.props.some(key => key === prop)
                  ? `props.${prop}`
                  : vmKeys.data.some(key => key === prop)
                    ? `data.${prop}`
                    : vmKeys.computed.some(key => key === prop)
                      ? `${vmKeys.computed}.value` : ''
              vmOutput.watch = watchOptionsStr
                ? vmOutput.watch.concat(
                  `watch(() => ${watchContentName}, (${watchFunctionStr.arg}) => ${watchFunctionStr.body}, ${watchOptionsStr})\n\n`
                )
                : vmOutput.watch.concat(
                  `watch(() => ${watchContentName}, (${watchFunctionStr.arg}) => ${watchFunctionStr.body})\n\n`
                )
            }
          }
          if (vmKeys.watch.length > 0) {
            vmOutput.watch = vmOutput.watch.substring(0, vmOutput.watch.length - 2)
            utilMethods.addImport('vue', 'watch')
          }
        },
        lifeCycle: () => {
          for (const prop in vmContent.lifeCycle) {
            const lifeCycleContent = vmContent.lifeCycle[prop]
            const lifeCycleContentName = `on${lifeCycleContent.name.substring(0, 1).toUpperCase()}${lifeCycleContent.name.substring(1)}`
            const lifeCycleFunctionStr = utilMethods.getFunctionStr(lifeCycleContent)
            if (['beforeCreate', 'created'].includes(lifeCycleContent.name)) {
              vmOutput.lifeCycle = vmOutput.lifeCycle.concat(
                lifeCycleContent.constructor.name === 'AsyncFunction'
                  ? `async function ${lifeCycleContentName} (${lifeCycleFunctionStr.arg})\n${lifeCycleFunctionStr.body}\n${lifeCycleContentName}()\n\n`
                  : `function ${lifeCycleContentName} (${lifeCycleFunctionStr.arg})\n${lifeCycleFunctionStr.body}\n${lifeCycleContentName}()\n\n`
              )
            } else {
              const v3LifeCycleName = {
                beforeMount: 'onBeforeMount',
                mounted: 'onMounted',
                beforeUpdate: 'onBeforeUpdate',
                updated: 'onUpdated',
                beforeDestroy: 'onBeforeUnmount',
                destroyed: 'onUnmounted',
                activated: 'onActivated',
                deactivated: 'onDeactivated',
                errorCaptured: 'onErrorCaptured'
              }[lifeCycleContent.name]
              vmOutput.lifeCycle = vmOutput.lifeCycle.concat(
                lifeCycleContent.constructor.name === 'AsyncFunction'
                  ? `${v3LifeCycleName} (async(${lifeCycleFunctionStr.arg}) => ${lifeCycleFunctionStr.body})\n\n`
                  : `${v3LifeCycleName} ((${lifeCycleFunctionStr.arg}) => ${lifeCycleFunctionStr.body})\n\n`
              )
              utilMethods.addImport('vue', v3LifeCycleName)
            }
          }
          if (vmKeys.lifeCycle.length > 0) {
            vmOutput.lifeCycle = vmOutput.lifeCycle.substring(0, vmOutput.lifeCycle.length - 2)
          }
        },
        methods: () => {
          for (const prop in vmContent.methods) {
            const methodsContent = vmContent.methods[prop]
            const methodsFunctionStr = utilMethods.getFunctionStr(methodsContent)
            vmOutput.methods = vmOutput.methods.concat(
              methodsContent.constructor.name === 'AsyncFunction'
                ? `async function ${methodsContent.name} (${methodsFunctionStr.arg})\n${methodsFunctionStr.body}\n\n`
                : `function ${methodsContent.name} (${methodsFunctionStr.arg})\n${methodsFunctionStr.body}\n\n`
            )
          }
          if (vmKeys.methods.length > 0) {
            vmOutput.methods = vmOutput.methods.substring(0, vmOutput.methods.length - 2)
          }
        },
        filters: () => {
          for (const prop in vmContent.filters) {
            const filtersContent = vmContent.filters[prop]
            const filtersFunctionStr = utilMethods.getFunctionStr(filtersContent)
            vmOutput.filters = vmOutput.filters.concat(
              `function ${filtersContent.name} (${filtersFunctionStr.arg})\n${filtersFunctionStr.body}\n\n`
            )
          }
          if (vmKeys.filters.length > 0) {
            vmOutput.filters = vmOutput.filters.substring(0, vmOutput.filters.length - 2)
          }
        },
        import: () => {
          for (const prop in vmContent.import) {
            const importContent = vmContent.import[prop]
            if (importContent.length > 0) {
              vmOutput.import = vmOutput.import.concat(`import { ${importContent.join(', ')} } from '${prop}'\n`)
            }
          }
          if (vmKeys.import().length > 0) {
            vmOutput.import = vmOutput.import.substring(0, vmOutput.import.length - 1)
          }
        },
        use: () => {
          for (const prop in vmContent.use) {
            const useContent = vmContent.use[prop]
            vmOutput.use = vmOutput.use.concat(`${useContent}\n`)
          }
          if (vmKeys.use().length > 0) {
            vmOutput.use = vmOutput.use.substring(0, vmOutput.use.length - 1)
          }
        },
        emits: () => {
          for (const emits of vmContent.emits) {
            const emitsContent = emits.split('update:').pop()
            vmOutput.emits = vmOutput.emits.concat(`'${emitsContent}', `)
          }
          if (vmContent.emits.length > 0) {
            vmOutput.emits = `const emit = defineEmits([${vmOutput.emits.substring(0, vmOutput.emits.length - 2)}])`
          }
        },
        refs: () => {
          for (const refs of vmContent.refs) {
            vmOutput.refs = vmOutput.refs.concat(`const ${refs} = ref(null)\n`)
          }
          if (vmContent.refs.length > 0) {
            vmOutput.refs = vmOutput.refs.substring(0, vmOutput.refs.length - 1)
          }
        },
        output: () => {
          for (const prop in vmOutput) {
            const vmOutputContent = vmOutput[prop]
            if (vmOutputContent) {
              outputSrciptContent = outputSrciptContent.concat(`${vmOutputContent}\n\n`)
            }
          }
        }
      }

      // util methods init
      const utilMethods = {
        addImport: (type, value) => {
          if (typeof type === 'string' && typeof value === 'string') {
            const importContent = vmContent.import[type]
            if (!importContent?.includes(value)) {
              importContent.push(value)
            }
          }
        },
        getIndexArr: (values, content) => {
          const result = []
          if (values instanceof Array && typeof content === 'string') {
            for (const value of values) {
              const indexValue = content.indexOf(value.str, value.start)
              if (indexValue !== -1) {
                result.push(value.append ? indexValue + (+value.str.length) : indexValue)
              }
            }
          }
          return result
        },
        getKeysArr: (value) => {
          const result = []
          for (const prop in value) {
            const keys = value[prop]
            for (const key of keys) {
              result.push({ prop, key })
            }
          }
          result.sort((a, b) => b.key.length - a.key.length)
          return result
        },
        getObjectStr: (value, objExcludeProps = []) => {
          let result = ''
          if (typeof value === 'function') {
            result = utilMethods.getFunctionStr(value).main
          } else if (value instanceof Array) {
            for (const item of value) {
              result = result.concat(`${utilMethods.getObjectStr(item)}, `)
            }
            result = `[${result.substring(0, result.length - 2)}]`
          } else if (typeof value === 'object' && value !== null) {
            for (const prop in value) {
              if (!objExcludeProps.includes(prop)) {
                result = result.concat(`${prop}: ${utilMethods.getObjectStr(value[prop])},\n`)
              }
            }
            result = Object.keys(value).length > 0 ? `{\n${result.substring(0, result.length - 2)}\n}` : '{}'
          } else if (typeof value === 'string') {
            result = `'${value}'`
          } else {
            result = `${value}`
          }
          return result
        },
        getFunctionStr: (value, options = {}) => {
          const result = {
            main: '',
            arg: '',
            body: ''
          }
          if (typeof value === 'function') {
            result.main = value.toString()
            for (
              const { prop, key } of utilMethods.getKeysArr({
                props: vmKeys.props,
                data: vmKeys.data,
                computed: vmKeys.computed,
                methods: vmKeys.methods
              })
            ) {
              if (prop === 'props') {
                result.main = result.main.replaceAll(`this.${key}`, `props.${key}`)
              } else if (prop === 'data') {
                result.main = result.main.replaceAll(`this.${key}`,  options.useData ? `useData().${key}` : `data.${key}`)
              } else if (prop === 'computed') {
                result.main = result.main.replaceAll(`this.${key}`, `${key}.value`)
              } else if (prop === 'methods') {
                result.main = result.main.replaceAll(`this.${key}`, `${key}`)
              }
            }
            if (result.main.includes('useData()')) {
              vmContent.use.data = 'const useData = () => data'
            }
            for (
              const key of [
                '$data', '$props', '$el', '$options', '$parent', '$root', '$children', '$isServer',
                '$listeners', '$watch', '$on', '$once', '$off', '$mount', '$forceUpdate', '$destroy'
              ]
            ) {
              let hasContent = false
              if (result.main.includes(`this.${key}`)) {
                result.main = result.main.replaceAll(`this.${key}`, `$vm.proxy.${key}`)
                hasContent = true
              }
              if (hasContent) {
                utilMethods.addImport('vue', 'getCurrentInstance')
                vmContent.use.vm = 'const $vm = getCurrentInstance()'
              }
            }
            if (result.main.includes('this.$attrs')) {
              utilMethods.addImport('vue', 'useAttrs')
              result.main = result.main.replaceAll('this.$attrs', 'attrs')
              vmContent.use.attrs = 'const attrs = useAttrs()'
            }
            if (result.main.includes('this.$slots')) {
              utilMethods.addImport('vue', 'useSlots')
              result.main = result.main.replaceAll('this.$slots', 'slots')
              vmContent.use.slots = 'const slots = useSlots()'
            }
            if (result.main.includes('this.$router')) {
              utilMethods.addImport('vue-router', 'useRouter')
              result.main = result.main.replaceAll('this.$router', 'router')
              vmContent.use.router = 'const router = useRouter()'
            }
            if (result.main.includes('this.$route')) {
              utilMethods.addImport('vue-router', 'useRoute')
              result.main = result.main.replaceAll('this.$route', 'route')
              vmContent.use.route = 'const route = useRoute()'
            }
            if (result.main.includes('this.$store')) {
              utilMethods.addImport('vuex', 'useStore')
              result.main = result.main.replaceAll('this.$store', 'store')
              vmContent.use.store = 'const store = useStore()'
            }
            if (result.main.includes('this.$nextTick')) {
              utilMethods.addImport('vue', 'nextTick')
              result.main = result.main.replaceAll('this.$nextTick', 'nextTick')
            }
            if (result.main.includes('this.$set')) {
              utilMethods.addImport('vue', 'set')
              result.main = result.main.replaceAll('this.$set', 'set')
            }
            if (result.main.includes('this.$delete')) {
              utilMethods.addImport('vue', 'del')
              result.main = result.main.replaceAll('this.$delete', 'del')
            }
            if (result.main.includes('this.$emit')) {
              const contentArr = result.main.split('this.$emit')
              if (contentArr.length > 1) {
                for (let i = 1; i < contentArr.length; i++) {
                  const beginIndex = Math.min(
                    ...utilMethods.getIndexArr([
                      { str: `this.$emit('`, start: 0, append: true },
                      { str: `this.$emit("`, start: 0, append: true },
                      { str: 'this.$emit(`', start: 0, append: true }
                    ], result.main)
                  )
                  const endIndex = Math.min(
                    ...utilMethods.getIndexArr([
                      { str: `'`, start: beginIndex },
                      { str: `"`, start: beginIndex },
                      { str: '`', start: beginIndex }
                    ], result.main)
                  )
                  const emitName = result.main.substring(beginIndex, endIndex)
                  if (emitName) {
                    if (!vmContent.emits.includes(emitName)) {
                      vmContent.emits.push(emitName)
                    }
                    result.main = result.main.replace('this.$emit', 'emit')
                  }
                }
              }
            }
            if (result.main.includes('this.$refs')) {
              const contentArr = result.main.split('this.$refs')
              if (contentArr.length > 1) {
                for (let i = 1; i < contentArr.length; i++) {
                  const beginIndex = Math.min(
                    ...utilMethods.getIndexArr([
                      { str: 'this.$refs.', start: 0, append: true }
                    ], result.main)
                  )
                  const endIndex = Math.min(
                    ...utilMethods.getIndexArr([
                      { str: `.`, start: beginIndex },
                      { str: `?.`, start: beginIndex },
                      { str: `[`, start: beginIndex }
                    ], result.main)
                  )
                  const refsName = result.main.substring(beginIndex, endIndex)
                  if (refsName) {
                    if (!vmContent.refs.includes(refsName)) {
                      vmContent.refs.push(refsName)
                    }
                    result.main = `${result.main.substring(0, endIndex)}.value${result.main.substring(endIndex, result.main.length)}`
                    result.main = result.main.replace('this.$refs.', '')
                  }
                }
              }
              utilMethods.addImport('vue', 'ref')
            }
            result.arg = result.main.substring(
              result.main.indexOf('(') + 1,
              Math.min(
                ...utilMethods.getIndexArr([
                  { str: ') {', start: 0, append: false },
                  { str: ') =>', start: 0, append: false }
                ], result.main)
              )
            )
            result.body = result.main.substring(
              Math.min(
                ...utilMethods.getIndexArr([
                  { str: ') {', start: 0, append: true },
                  { str: '=> {', start: 0, append: true }
                ], result.main)
              ) - 1,
              result.main.length
            )
          }
          return result
        },
        getPropsStr: (value, functionToString = false) => {
          let result = ''
          if (typeof value === 'function' && !functionToString) {
            result = `${value.name}`
          } else if (value instanceof Array) {
            for (const item of value) {
              result = result.concat(`${utilMethods.getPropsStr(item)}, `)
            }
            result = `[${result.substring(0, result.length - 2)}]`
          } else if (typeof value === 'object' && value !== null) {
            for (const prop in value) {
              result = result.concat(`${prop}: ${utilMethods.getPropsStr(value[prop], ['default', 'validator'].includes(prop))},\n`)
            }
            result = Object.keys(value).length > 0 ? `{\n${result.substring(0, result.length - 2)}\n}` : '{}'
          } else if (typeof value === 'string') {
            result = `'${value}'`
          } else {
            result = `${value}`
          }
          return result
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
    } catch (err) {
      throw new Error(err)
    }
  }
}

export default Vue2ToCompositionApi
