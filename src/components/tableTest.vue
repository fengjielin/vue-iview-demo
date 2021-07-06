<template>
  <div class="tableTest">
    <Table
      border
      ref="selection"
      :columns="columns"
      :data="data1"
      @on-row-click="rowClick"
      @on-selection-change="selected"
    ></Table>
    <Table border ref="selection1" :columns="columns1" :data="data2"></Table>
    <Button @click="handleRelevance">关联</Button> |
    <Button @click="save">保存</Button>
  </div>
</template>

<script>
import data0 from "../data.json";

export default {
  data() {
    return {
      // 未关联表格的列数据
      columns: [
        {
          type: "selection",
          width: 60,
          align: "center",
        },
        {
          title: "Name",
          key: "name",
        },
        {
          title: "Sex",
          key: "sex",
        },
        {
          title: "Birthday",
          key: "birthday",
        },
      ],
      // 未关联表格的表格数据
      data1: [],

      // 已关联表格的列数据
      columns1: [
        {
          type: "index",
          width: 60,
          align: "center",
        },
        {
          title: "Name",
          key: "name",
        },
        {
          title: "Sex",
          key: "sex",
        },
        {
          title: "Birthday",
          key: "birthday",
        },
      ],
      // 已关联表格的表格数据
      data2: [],
      // 未关联表格中已选中的数据
      selectedData:[]
    };
  },
  methods: {
    // @on-row-click 点击某一行选中 
    rowClick(row, index) {
      this.$refs.selection.toggleSelect(index);
    },
    // @on-selection-change 选中项发生变化时触发
    selected(selection) {
      this.selectedData = selection;
    },
    // 点击关联按钮
    handleRelevance(){
      this.selectedData.forEach((item) => {
        let index = this.data1.findIndex(item0 =>item0.id === item.id);
        this.data1.splice(index,1);
        this.data2.push(item);
      })
    },
    // 点击保存按钮
    save(){
      console.log(this.data2);
      this.$Message.success('发送数据');
    }
  },
  mounted() {
    this.data1 = data0;
  },
};
</script>

<style scoped>
.tableTest {
  width: 680px;
  margin: 0 auto;
}
.ivu-table-wrapper {
  margin-bottom: 10px;
}
</style>