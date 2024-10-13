<template>
  <div>
    <el-drawer ref="drawer" v-model="drawer" :title="title" destroy-on-close direction="rtl" :append-to-body="true" :before-close="handleClose">
      <component
        :is="node ? node.type : ''"
        :ref="node ? node.type : ''"
        v-model="form"
        :disabled="disabled"
        :skip-condition-show="skipConditionShow"
      >
        <template v-for="(item, key) in $slots" #[key]="data">
          <slot :name="key" v-bind="data || {}"></slot>
        </template>
      </component>
    </el-drawer>
  </div>
</template>

<script>
import Start from './start.vue';
import Between from './between.vue';
import Serial from './serial.vue';
import Parallel from './parallel.vue';
import End from './end.vue';
import Skip from './skip.vue';

export default {
  components: {
    Start,
    Between,
    Serial,
    Parallel,
    End,
    Skip
  },
  props: {
    value: {
      type: Object,
      default() {
        return {};
      }
    },
    node: {
      type: Object,
      default() {
        return {};
      }
    },
    lf: {
      type: Object,
      default() {
        return null;
      }
    },
    disabled: {
      // 是否禁止
      type: Boolean,
      default: false
    },
    skipConditionShow: {
      // 是否显示跳转条件
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      drawer: false,
      form: {},
      objId: undefined,
      nodeCode: null
    };
  },
  computed: {
    title() {
      if (this.node && this.node.type === 'skip') {
        return '设置边属性';
      } else if (this.node && this.node.type === 'serial') {
        return '设置串行网关属性';
      } else if (this.node && this.node.type === 'parallel') {
        return '设置并行网关属性';
      } else if (this.node && this.node.type === 'start') {
        return '设置开始属性';
      } else if (this.node && this.node.type === 'end') {
        return '设置结束属性';
      }
      return '设置中间属性';
    }
  },
  watch: {
    node(n) {
      if (n) {
        this.objId = n.id;
        let skipCondition = n.properties.skipCondition;
        let conditionSpl = skipCondition ? skipCondition.split('@@|') : [];
        let conditionSplTwo = conditionSpl && conditionSpl.length > 0 ? conditionSpl[1] : [];
        let condition,
          conditionType,
          conditionValue = '';
        if (conditionSpl && conditionSpl.length > 0 && conditionSpl[0] === '@@spel') {
          conditionType = 'spel';
          conditionValue = conditionSplTwo;
        } else if (conditionSpl && conditionSpl.length > 0 && conditionSpl[0] !== '@@spel') {
          condition = conditionSplTwo && conditionSplTwo.length > 0 ? conditionSplTwo.split('@@')[0] : '';
          conditionType = conditionSplTwo && conditionSplTwo.length > 0 ? conditionSplTwo.split('@@')[1] : '';
          conditionValue = conditionSplTwo && conditionSplTwo.length > 0 ? conditionSplTwo.split('@@')[2] : '';
        }
        if (n.type === 'skip') {
          this.form = {
            nodeType: n.type,
            skipType: n.properties.skipType,
            skipName: n.properties.skipName,
            skipCondition: skipCondition,
            condition: condition,
            conditionType: conditionType,
            conditionValue: conditionValue
          };
        } else {
          let nodeRatio = n.properties.nodeRatio || '';
          if (!n.properties.collaborativeWay) {
            n.properties.collaborativeWay = nodeRatio === '0.000' ? '1' : nodeRatio === '100.000' ? '3' : nodeRatio ? '2' : '1';
          }
          n.properties.formCustom = JSON.stringify(n.properties) === '{}' ? 'N' : n.properties.formCustom || '';
          this.form = {
            nodeType: n.type,
            nodeCode: n.id,
            nodeName: n.text instanceof Object ? n.text.value : n.text,
            ...n.properties
          };
        }
      }
    },
    'form.nodeCode'(n) {
      this.nodeCode = n;
    },
    'form.skipType'(n) {
      // 监听跳转属性变化并更新
      this.lf.setProperties(this.objId, {
        skipType: n
      });
    },
    'form.nodeName'(n) {
      // 监听节点名称变化并更新
      this.lf.updateText(this.objId, n);
      // 监听节点名称变化并更新
      this.lf.setProperties(this.objId, {
        nodeName: n
      });
    },
    'form.collaborativeWay'(n) {
      this.lf.setProperties(this.objId, {
        nodeRatio: n === '1' ? '0.000' : n === '3' ? '100.000' : ''
      });
    },
    'form.nodeRatio'(n) {
      this.lf.setProperties(this.objId, {
        nodeRatio: n
      });
    },
    'form.permissionFlag'(n) {
      // 监听节点属性变化并更新
      this.lf.setProperties(this.objId, {
        permissionFlag: Array.isArray(n) ? n.join(',') : n
      });
    },
    'form.skipAnyNode'(n) {
      // 监听跳转属性变化并更新
      this.lf.setProperties(this.objId, {
        skipAnyNode: n
      });
    },
    'form.listenerType'(n) {
      // 监听监听器类型变化并更新
      this.lf.setProperties(this.objId, {
        listenerType: Array.isArray(n) ? n.join(',') : n
      });
    },
    'form.listenerPath'(n) {
      // 监听监听器路径变化并更新
      this.lf.setProperties(this.objId, {
        listenerPath: n
      });
    },
    'form.formCustom'(n) {
      this.lf.setProperties(this.objId, {
        formCustom: n || ''
      });
    },
    'form.formPath'(n) {
      this.lf.setProperties(this.objId, {
        formPath: n
      });
    },
    'form.skipCondition'(n) {
      // 监听跳转属性变化并更新
      this.lf.setProperties(this.objId, {
        skipCondition: n
      });
    },
    'form.skipName'(n) {
      if (['skip'].includes(this.node.type)) {
        debugger;
        // 监听跳转名称变化并更新
        this.lf.updateText(this.objId, n);
        // 监听跳转属性变化并更新
        this.lf.setProperties(this.objId, {
          skipName: n
        });
      }
    }
  },
  created() {},
  methods: {
    show() {
      this.drawer = true;
    },
    handleClose() {
      // 监听节点编码变量并更新
      if (this.nodeCode && this.objId) {
        if (['skip'].includes(this.node?.type)) {
          if (!this.lf.getEdgeModelById(this.nodeCode)) {
            this.lf.changeEdgeId(this.objId, this.nodeCode);
          }
        } else {
          if (!this.lf.getNodeModelById(this.nodeCode)) {
            this.lf.changeNodeId(this.objId, this.nodeCode);
          }
        }
      }
      if (this.node?.type === 'between') {
        this.$refs.between.$refs.form.validate((valid) => {
          if (valid) {
            this.drawer = false;
          }
        });
      } else this.drawer = false;
    }
  }
};
</script>

<style scoped>
.el-drawer__container ::-webkit-scrollbar {
  display: none;
}
</style>
