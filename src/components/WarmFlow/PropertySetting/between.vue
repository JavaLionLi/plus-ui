<template>
  <div class="between">
    <el-form ref="form" :model="form" label-width="120px" :rules="rules" size="small" :disabled="disabled">
      <slot name="form-item-task-nodeCode" :model="form" field="nodeCode">
        <el-form-item label="节点编码">
          <el-input v-model="form.nodeCode" :disabled="disabled"></el-input>
        </el-form-item>
      </slot>
      <slot name="form-item-task-nodeName" :model="form" field="nodeName">
        <el-form-item label="节点名称">
          <el-input v-model="form.nodeName" :disabled="disabled"></el-input>
        </el-form-item>
      </slot>
      <slot name="form-item-task-collaborativeWay" :model="form" field="collaborativeWay">
        <el-form-item label="协作方式">
          <el-radio-group v-model="form.collaborativeWay" @change="collaborativeWayChange">
            <el-radio v-if="form.collaborativeWay === '1'" label="1">
              或签
              <el-tooltip class="item" effect="dark" content="只需一个人审批">
                <i class="el-icon-question" style="color: #000"></i>
              </el-tooltip>
            </el-radio>
            <el-radio v-if="form.collaborativeWay === '2'" label="2">
              票签
              <el-tooltip class="item" effect="dark" content="部分办理人审批，只支持选择用户">
                <i class="el-icon-question" style="color: #000"></i>
              </el-tooltip>
            </el-radio>
            <el-radio v-if="form.collaborativeWay === '3'" label="3">
              会签
              <el-tooltip class="item" effect="dark" content="所有办理都需要审批，只支持选择用户">
                <i class="el-icon-question" style="color: #000"></i>
              </el-tooltip>
            </el-radio>
          </el-radio-group>
        </el-form-item>
      </slot>
      <slot v-if="form.collaborativeWay === '2'" name="form-item-task-nodeRatio" :model="form" field="nodeRatio">
        <el-form-item label="票签占比" prop="nodeRatio">
          <el-input v-model="form.nodeRatio" type="number" placeholder="请输入"></el-input>
          <div class="placeholder">票签比例范围：(0-100)的值</div>
        </el-form-item>
      </slot>
      <slot name="form-item-task-permissionFlag" :model="form" field="permissionFlag">
        <el-tooltip effect="dark" :content="userNameList" :disabled="!disabled">
          <el-form-item label="办理人选择">
            <el-select
              v-if="form.collaborativeWay === '1'"
              v-model="form.permissionFlag"
              multiple
              collapse-tags
              :disabled="disabled"
              allow-create
              :clearable="!disabled"
              filterable
            >
              <el-option-group v-for="groupOption in groupOptions" :key="groupOption.label" :label="groupOption.label" :disabled="disabled">
                <el-option v-for="item in groupOption.options" :key="item.value" :label="item.label" :value="item.value"> </el-option>
              </el-option-group>
            </el-select>
            <el-select
              v-else
              v-model="form.permissionFlag"
              multiple
              collapse-tags
              :disabled="disabled"
              :clearable="!disabled"
              popper-class="dialogSelect"
              :popper-append-to-body="false"
              @focus="initUser"
            >
              <el-option v-for="item in form.permissionFlag" :key="item" :label="item" :value="item"> </el-option>
            </el-select>
          </el-form-item>
        </el-tooltip>
      </slot>
      <slot name="form-item-task-listenerType" :model="form" field="listenerType">
        <el-form-item label="监听器类型">
          <el-select v-model="form.listenerType" multiple>
            <el-option label="任务创建" value="create"></el-option>
            <el-option label="任务开始办理" value="start"></el-option>
            <el-option label="分派监听器" value="assignment"></el-option>
            <el-option label="任务完成" value="finish"></el-option>
          </el-select>
        </el-form-item>
      </slot>
      <slot name="form-item-task-listenerPath" :model="form" field="listenerPath">
        <el-form-item label="监听器路径" description="输入监听器的路径，以@@分隔,顺序与监听器类型一致">
          <el-input v-model="form.listenerPath" type="textarea" rows="8"></el-input>
          <el-tooltip class="item" effect="dark" content="输入监听器的路径，以@@分隔，顺序与监听器类型一致">
            <i class="el-icon-question"></i>
          </el-tooltip>
        </el-form-item>
      </slot>
      <slot name="form-item-task-formCustom" :model="form" field="formCustom">
        <el-form-item label="审批表单是否自定义">
          <el-select v-model="form.formCustom">
            <el-option label="使用流程表单" :value="''"></el-option>
            <!-- <el-option label="节点自定义表单" value="Y"></el-option> -->
            <el-option label="节点表单路径" value="N"></el-option>
          </el-select>
        </el-form-item>
      </slot>
      <slot v-if="form.formCustom === 'N'" name="form-item-task-formPath" :model="form" field="formPath">
        <el-form-item label="审批表单路径">
          <el-input v-model="form.formPath"></el-input>
        </el-form-item>
      </slot>
    </el-form>

    <!-- 权限标识：会签票签选择用户 -->
    <el-dialog v-model:visible="userVisible" title="用户选择" width="80%" append-to-body>
      <!-- <selectUser v-model:select-user="form.permissionFlag" v-model:user-visible="userVisible" @handle-user-select="handleUserSelect"></selectUser> -->
    </el-dialog>
  </div>
</template>

<script>
import { optionSelect as listRole } from '@/api/system/role';
import { optionSelect as listUser } from '@/api/system/user';
import { optionSelect as listDept } from '@/api/system/dept';
//import selectUser from '@/views/components/selectUser';

export default {
  name: 'Between',
  components: {
    //selectUser
  },
  props: {
    value: {
      type: Object,
      default() {
        return {};
      }
    },
    disabled: {
      // 是否禁止
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      form: this.value,
      userNameList: '',
      groupOptions: [],
      rules: {
        nodeRatio: [
          { required: false, message: '请输入', trigger: 'change' },
          { pattern: /^(?:[1-9]\d?|0\.\d{1,3}|[1-9]\d?\.\d{1,3})$/, message: '请输入(0, 100)的值，最多保留三位小数', trigger: ['change', 'blur'] }
        ]
      },
      userVisible: false
    };
  },
  watch: {
    form: {
      handler(n) {
        this.$emit('change', n);
      },
      deep: true
    }
  },
  created() {
    if (this.form.permissionFlag) {
      this.form.permissionFlag = this.form.permissionFlag.split(',');
    }
    if (this.form.listenerType) {
      this.form.listenerType = this.form.listenerType.split(',');
    }
    this.getPermissionFlag();
    if (this.disabled) this.getIdReverseDisplayName();
  },
  methods: {
    // 根据id查用户名
    getIdReverseDisplayName() {
      if (this.form.collaborativeWay !== '1') {
        idReverseDisplayName(this.form.permissionFlag.join(',')).then((res) => {
          this.userNameList = res.data ? res.data.map((e) => e.nickName).join(',') : '';
        });
      }
    },
    /** 选择角色权限范围触发 */
    getPermissionFlag() {
      let groupOptionCreateBy = {
        label: '创建人',
        options: [
          {
            value: 'warmFlowInitiator',
            label: '流程发起人'
          }
        ]
      };
      this.groupOptions.push(groupOptionCreateBy);
      listRole([]).then((response) => {
        let groupOption = {
          label: '角色',
          options: response.data.map((item) => {
            return {
              value: 'role:' + item.roleId,
              label: item.roleName
            };
          })
        };
        this.groupOptions.push(groupOption);
        listUser([]).then((response) => {
          let groupOption = {
            label: '用户',
            options: response.data.map((item) => {
              return {
                value: item.userId,
                label: item.nickName
              };
            })
          };
          this.groupOptions.push(groupOption);
          listDept([]).then((response) => {
            let groupOption = {
              label: '部门',
              options: response.data.map((item) => {
                return {
                  value: 'dept:' + item.deptId,
                  label: item.deptName
                };
              })
            };
            this.groupOptions.push(groupOption);
            if (this.disabled && this.form.collaborativeWay === '1') {
              let userNameList = [];
              this.groupOptions.forEach((e) => {
                e.options.forEach((o) => {
                  if (this.form.permissionFlag.includes(o.value)) userNameList.push(o.label);
                });
              });
              this.userNameList = userNameList.join(',');
            }
          });
        });
      });
    },
    collaborativeWayChange(val) {
      this.form.permissionFlag = [];
      this.$set(this.form, 'nodeRatio', val === '1' ? '0.000' : val === '3' ? '100.000' : '');
    },
    // 打开用户选择弹窗
    initUser() {
      this.userVisible = true;
    },
    // 获取选中用户数据
    handleUserSelect(checkedItemList) {
      this.form.permissionFlag = checkedItemList.map((e) => {
        return e.userId;
      });
    }
  }
};
</script>

<style scoped>
.dialogSelect {
  display: none;
}
.placeholder {
  color: #828f9e;
  font-size: 12px;
}
</style>
