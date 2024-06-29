<template>
  <el-dialog v-model="data.visible" title="人员设置" width="80%" append-to-body destroy-on-close>
    <div>
      <BpmnUserConfig ref="bpmnUserConfigRef"></BpmnUserConfig>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import BpmnUserConfig from '@/components/BpmnUserConfig/index.vue';

const data = reactive({
  visible: false,
  type: '',
  xmlStr: ''
});

const bpmnUserConfigRef = ref<InstanceType<typeof BpmnUserConfig>>();
//打开
const openDialog = (id) => {
  data.visible = true;
  /** 必须放在nextTick 否则第一次打开为空 */
  nextTick(() => {
    bpmnUserConfigRef.value?.init(id);
  });
};
/**
 * 对外暴露子组件方法
 */
defineExpose({
  openDialog
});
</script>
