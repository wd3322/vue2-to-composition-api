# Vue2 Opitons api to Vue 3 Composition api

## 官方网站

[Github: vue2-to-composition-api](https://wd3322.github.io/to-vue3/)

[Gitee: vue2-to-composition-api](http://wd3322.gitee.io/to-vue3/)

**Git地址**

[Github](https://github.com/wd3322/vue2-to-composition-api)

[Gitee](https://gitee.com/wd3322/vue2-to-composition-api)


## 在线使用
![home](https://wd3322.github.io/to-vue3/img/home.png)

## Props / Data 数据转换
![props_data](https://wd3322.github.io/to-vue3/img/props_data.png)

## Computed 计算器属性转换
![computed](https://wd3322.github.io/to-vue3/img/computed.png)

## Watch 侦听器转换
![watch](https://wd3322.github.io/to-vue3/img/watch.png)

## Life cycle 生命周期转换
![life_cycle](https://wd3322.github.io/to-vue3/img/life_cycle.png)

## Methods 方法转换
![methods](https://wd3322.github.io/to-vue3/img/methods.png)

## Install 安装
```node
npm install vue2-to-composition-api
```

## Conversion 使用转换
```javascript
import Vue2ToCompositionApi from 'vue2-to-composition-api'

const vue2ScriptContentStr = `
export default {
  name: 'Sample',
  props: {
    userInfo: {
      type: Object,
      required: false,
      default: () => ({
        userName: 'Todd Cochran',
        userAge: 20
      })
    }
  },
  data() {
    return {
      firstName: '',
      lastName: ''
    }
  }
}`
const vue3ScriptContentStr = Vue2ToCompositionApi(vue2ScriptContentStr)
console.log('Hello! Composition API\n', vue3ScriptContentStr)
```

## 无法解析的内容

请不要键入 `Mixin`、`Component` 等外部内容，转换器无法解析外部的文件，`Mixin` 混入内部的变量与方法都需另外手工处理，动态变量或者拼接的内容也同样无法被解析或解析错误

```javascript
export default {
  name: 'Sample',
  mixins: [myMixin],
  components: { Echart },
  methods: {
    onSubmit(propName) {
      this[propName] = '123'
      this.$emit(propName + '-change')
    }
  }
}
```

## Template中的Data变更

转换后需为 `Template` 中的 `Data` 数据需加上 `.data` 前缀，其原因是许多开发者在Options API语法中做了改变引用类型数据地址的行为（如下），`Data` 将会被转换为一个完整的对象以兼容此类操作，此方式额外产生的迭代成本更小

**Options API:**

```html
<template>
  <div>{{ userInfo }}</div>
</template>
```

```javascript
export default {
  name: 'Sample',
  data() {
    return {
      userInfo: {}
    }
  },
  created() {
    this.userInfo = { name: 'Casey Adams', age: 80 }
  }
}
```

**Composition API:**

```html
<template>
  <div>{{ data.userInfo }}</div>
</template>
```

```javascript
import { reactive } from 'vue'

const data = reactive({
  userInfo: {}
})

data.userInfo = { name: 'Casey Adams', age: 80 }
```

## Template中的Filter变更

`Filter` 已经被废弃，它将会被转换为外部的 `Function` 内容，需要在 `Template` 中改变 `Filter` 的调用方式

**Options API**

```html
<template>
  <div>{{ married | toMarried }}</div>
</template>
```

```javascript
export default {
  name: 'Sample',
  filters: {
    toMarried(value) {
      return value ? 'Yes' : 'No'
    }
  }
}
```

**Composition API:**

```html
<template>
  <div>{{ toMarried(data.married) }}</div>
</template>
```

```javascript
function toMarried(value) {
	return value ? 'Yes' : 'No'
}
```

## Vue2.7中延用Router3.x、Vuex3.x

如若不想在 `Vue2.7` 项目中更新 `Router4` 与 `Vuex4` ，可以从 `vue` 实例中获取 `Router`、`Router`、`Store`

```javascript
import { getCurrentInstance } from 'vue'

const $vm = getCurrentInstance()
const router = $vm.proxy.$router
const route = $vm.proxy.$route
const store = $vm.proxy.$store
```

---

Package: vue2-to-composition-api

E-mail: diquick@qq.com

Author: wd3322
