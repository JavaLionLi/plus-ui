<template>
  <div v-loading="loading" class="bpmnDialogContainers">
    <el-header style="border-bottom: 1px solid rgb(218 218 218); height: auto">
      <div class="header-div">
        <div>
          <el-tooltip effect="dark" content="自适应屏幕" placement="bottom">
            <el-button size="small" icon="Rank" @click="fitViewport" />
          </el-tooltip>
          <el-tooltip effect="dark" content="放大" placement="bottom">
            <el-button size="small" icon="ZoomIn" @click="zoomViewport(true)" />
          </el-tooltip>
          <el-tooltip effect="dark" content="缩小" placement="bottom">
            <el-button size="small" icon="ZoomOut" @click="zoomViewport(false)" />
          </el-tooltip>
        </div>
      </div>
    </el-header>
    <div class="flow-containers">
      <el-container class="bpmn-el-container" style="align-items: stretch">
        <el-main style="padding: 0">
          <div ref="canvas" class="canvas" />
        </el-main>
      </el-container>
    </div>
    <!-- 节点配置 -->
    <el-dialog v-model="userTaskDialog.visible" :title="userTaskDialog.title" width="800px" append-to-body draggable :close-on-click-modal="false">
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="userTaskDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="userTaskDialog.visible = false">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import BpmnViewer from 'bpmn-js/lib/Viewer';
import MoveCanvasModule from 'diagram-js/lib/navigation/movecanvas';
import ZoomScrollModule from 'diagram-js/lib/navigation/zoomscroll';
import { ModuleDeclaration } from 'didi';
import type { Canvas, ModdleElement } from 'bpmn';
import EventBus from 'diagram-js/lib/core/EventBus';
import Overlays from 'diagram-js/lib/features/overlays/Overlays';
import { getUserTaskSetting } from '@/api/workflow/processDefinition';
const canvas = ref<HTMLElement>();
const modeler = ref<BpmnViewer>();
const zoom = ref(1);
const xml = ref('');
const loading = ref(false);
const bpmnVisible = ref(true);
const userTaskDialog = reactive<DialogOption>({
  visible: false,
  title: '节点配置'
});

const init = (processDefinitionId) => {
  loading.value = true;
  bpmnVisible.value = true;
  nextTick(async () => {
    if (modeler.value) modeler.value.destroy();
    modeler.value = new BpmnViewer({
      container: canvas.value,
      additionalModules: [
        {
          //禁止滚轮滚动
          zoomScroll: ['value', '']
        },
        ZoomScrollModule,
        MoveCanvasModule
      ] as ModuleDeclaration[]
    });
    const resp = await getUserTaskSetting(processDefinitionId);
    xml.value = resp.data.xml;
    await createDiagram(xml.value);
    loading.value = false;
  });
};

const createDiagram = async (data) => {
  try {
    await modeler.value.importXML(data);
    fitViewport();
    loading.value = false;
    addEventBusListener();
  } catch (err) {
    console.log(err);
  }
};
const addEventBusListener = () => {
  const eventBus = modeler.value.get<EventBus>('eventBus');
  const overlays = modeler.value.get<Overlays>('overlays');
  eventBus.on<ModdleElement>('element.click', (e) => {
    if (e.element.type === 'bpmn:UserTask') {
      userTaskDialog.visible = true;
      setTimeout(() => {}, 10);
    }
  });
  eventBus.on('element.out', (e) => {
    overlays.clear();
  });
};
// 让图能自适应屏幕
const fitViewport = () => {
  zoom.value = modeler.value.get<Canvas>('canvas').zoom('fit-viewport');
  const bbox = document.querySelector<SVGGElement>('.flow-containers .viewport').getBBox();
  const currentViewBox = modeler.value.get('canvas').viewbox();
  const elementMid = {
    x: bbox.x + bbox.width / 2 - 65,
    y: bbox.y + bbox.height / 2
  };
  modeler.value.get<Canvas>('canvas').viewbox({
    x: elementMid.x - currentViewBox.width / 2,
    y: elementMid.y - currentViewBox.height / 2,
    width: currentViewBox.width,
    height: currentViewBox.height
  });
  zoom.value = (bbox.width / currentViewBox.width) * 1.8;
};
// 放大缩小
const zoomViewport = (zoomIn = true) => {
  zoom.value = modeler.value.get<Canvas>('canvas').zoom();
  zoom.value += zoomIn ? 0.1 : -0.1;
  modeler.value.get<Canvas>('canvas').zoom(zoom.value);
};

defineExpose({
  init
});
</script>

<style lang="scss" scoped>
.canvas {
  width: 100%;
  height: 100%;
}

.header-div {
  display: flex;
  padding: 10px 0;
  justify-content: space-between;
}

.bpmn-el-container {
  height: calc(100vh - 350px);
}
:deep(.djs-element) {
  cursor: pointer;
}
</style>
