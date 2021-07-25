<template>
  <div class="courseRecord">
    <div class="content">
      <!-- 搜索与新增区域 -->
      <div style="display: flex; justify-content: flex-end">
        <Form :model="searchData" :label-width="60" inline>
          <FormItem label="院系：">
            <Select
              @on-change="searchWorkload"
              v-model="searchData.yxName"
              style="width: 200px"
              :filterable="true"
              clearable
            >
              <Option value="1">计算机系</Option>
              <Option value="2">美容美发系</Option>
            </Select>
          </FormItem>
          <FormItem style="margin-left: -60px">
            <Input
              @on-search="searchWorkload"
              :search="true"
              enter-button="搜索"
              type="text"
              v-model="searchData.teacherName"
              class="wd200"
              placeholder="输入教师姓名"
              maxlength="20"
            ></Input>
          </FormItem>
        </Form>
      </div>
      <!-- 表格区域 -->
      <div>
        <Table
          border
          :columns="workloadStatisticsColumns"
          :data="workloadStatisticsTable"
          :span-method="handleSpan"
        ></Table>

        <!-- 分页 -->
        <Page
          @on-change="changePage"
          :total="page.totalNum"
          :current="page.pageNum"
          :page-size="page.pageSize"
          show-elevator
          show-total
          class="page"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      searchData: {
        yxName: "",
        teacherName: "",
      },

      workloadStatisticsColumns: [
        {
          title: "教师姓名",
          key: "teacherName",
          align: "center",
          minWidth: 260,
        },
        {
          title: "班级名称",
          key: "className",
          align: "center",
          minWidth: 420,
        },
        {
          title: "课程名称",
          key: "courseName",
          align: "center",
          minWidth: 400,
        },
        {
          title: "课时数",
          key: "classHourNum",
          align: "center",
          minWidth: 300,
        },
        {
          title: "合计",
          key: "total",
          align: "center",
          minWidth: 300,
        },
      ],
      // 表格绑定的数据
      workloadStatisticsTable: [],

      // 分页管理
      page: {
        pageNum: 1,
        pageSize: 10,
        totalNum: 10,
      },

      // 模拟数据
      workloadStatisticsTable2: [
        {
          id: 1,
          teacherName: "张三",
          teacherId: 1,
          yxName: "1",
          className: "软件工程1班（40人）",
          courseName: "软件工程",
          classHourNum: "20",
          total: "45",
        },
        {
          id: 2,
          teacherName: "张三",
          teacherId: 1,
          yxName: "1",
          className: "软件工程1班（40人）",
          courseName: "高等数学",
          classHourNum: "25",
          total: "45",
        },
        {
          id: 3,
          teacherName: "王五",
          teacherId: 2,
          yxName: "2",
          className: "美容美发6班（32人）",
          courseName: "洗剪吹",
          classHourNum: "42",
          total: "42",
        },
      ],
    };
  },
  methods: {
    // row: 当前行; column: 当前列
    // rowIndex: 当前行索引; columnIndex: 当前列索引
    handleSpan({ row, column, rowIndex, columnIndex }) {
      if (columnIndex == 0) {
        //计算合并的行数列数
        let x = row.mergeCol == 0 ? 0 : row.mergeCol;
        let y = row.mergeCol == 0 ? 0 : 1;
        return [x, y];
      }
      if (columnIndex == 4) {
        //计算合并的行数列数
        let x = row.mergeCol == 0 ? 0 : row.mergeCol;
        let y = row.mergeCol == 0 ? 0 : 1;
        return [x, y];
      }
    },

    // 用于计算合并的规则
    assembleData(data) {
      let teacherNames = [];
      //筛选出不重复的 属性值,将其放到 数组中, 不需要合并的
      data.forEach((e) => {
        if (!teacherNames.includes(e.teacherName)) {
          teacherNames.push(e.teacherName);
        }
      });

      let teacherNameNums = [];
      //将teacherNames数组中的 teacherName值设置默认合并0个单元格,放到 teacherNameNums中
      teacherNames.forEach((e) => {
        teacherNameNums.push({ teacherName: e, num: 0 });
      });
      //计算每个 teacherName值所在行需要合并的单元格数
      data.forEach((e) => {
        teacherNameNums.forEach((n) => {
          if (e.teacherName == n.teacherName) {
            n.num++; //表示合并多少个单元格
          }
        });
      });

      // console.log(teacherNameNums);

      //将计算后的合并单元格数整合到 data中
      data.forEach((e) => {
        teacherNameNums.forEach((n) => {
          if (e.teacherName == n.teacherName) {
            if (teacherNames.includes(e.teacherName)) {
              e.mergeCol = n.num;
              //删除已经设置过的值(防止被合并的单元格进到这个 if 语句中)
              teacherNames.splice(teacherNames.indexOf(n.teacherName), 1);
            } else {
              //被合并的单元格设置为 0
              e.mergeCol = 0;
            }
          }
        });
      });
      console.log(data);
      // //将整理后的数据交给表格渲染
      this.workloadStatisticsTable = data;
    },

    // 搜索
    searchWorkload() {
      this.page.pageNum = 1;
      console.log("搜索");
      this.getWorkloadStatisticsData();
    },

    // 改变页码
    changePage(i) {
      console.log(i);
    },

    // 获取教室工作量数据
    getWorkloadStatisticsData() {
      let that = this;
      let data = {
        pageNum: this.page.pageNum,
        pageSize: this.page.pageSize,

        yxName: this.searchData.yxName,
        teacherName: this.searchData.teacherName,
      };
      console.log(data);

      // 搜索条件
      this.workloadStatisticsTable = [];
      if (this.searchData.yxName && this.searchData.teacherName == "") {
        this.workloadStatisticsTable2.forEach((item) => {
          if (item.yxName == this.searchData.yxName) {
            this.workloadStatisticsTable.push(item);
          }
        });
      }else if(this.searchData.yxName == undefined && this.searchData.teacherName){
        this.workloadStatisticsTable2.forEach((item) => {
          if (item.teacherName == this.searchData.teacherName) {
            this.workloadStatisticsTable.push(item);
          }
        });
      }else if(this.searchData.yxName && this.searchData.teacherName){
        this.workloadStatisticsTable2.forEach((item) => {
          if (item.yxName == this.searchData.yxName && item.teacherName == this.searchData.teacherName) {
            this.workloadStatisticsTable.push(item);
          }
        });
      }else{
        this.workloadStatisticsTable = this.workloadStatisticsTable2;
      }


      console.log(this.workloadStatisticsTable);
      this.assembleData(this.workloadStatisticsTable);
    },
  },
  mounted() {
    this.getWorkloadStatisticsData();
    console.log(this.workloadStatisticsTable);
  },
};
</script>

<style>
.courseRecord {
  width: 100%;
  padding: 20px 80px 0;
  height: 100%;
  background-color: #f3f8ff;
}

.courseRecord .content {
  margin-top: 24px;
  padding: 24px;
  padding-top: 32px;
  height: 754px;
  background-color: #fff;
}

.courseRecord .content .page {
  text-align: center;
  margin-top: 39px;
}

.courseRecord .ivu-table-header th {
  background-color: #f0faff;
}
</style>
