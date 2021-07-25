<template>
  <div>
    <Table
      :columns="columns14"
      :data="data5"
      border
      :span-method="handleSpan"
    ></Table>
  </div>
</template>
 
<script>
export default {
  data() {
    return {
      columns14: [
        {
          title: "Date",
          key: "date",
        },
        {
          title: "Name",
          key: "name",
        },
        {
          title: "Age",
          key: "age",
        },
        {
          title: "Address",
          key: "address",
        },
      ],
      data5: [],
      ignoreMergeRow: [],
    };
  },
  methods: {
    handleMergeRow(data) {
      let ret = JSON.parse(JSON.stringify(data));
      let collection = {};
      let preIndex = -1;
      for (let i in ret) {
        // item = {
        //     "name": "Jim",
        //     "age": 18,
        //     "address": "Sydney",
        //     "date": "2016-10-03"
        // }
        let item = ret[i];
        item.source = {};
        for (let key in item) {
          if (key == "source") {
            continue;
          }
          // 记录每个key
          // collection = {
          //     "name": {}
          // }
          if (!collection[key]) {
            collection[key] = {};
          }
          // 首项或者该项此列不等于上一项此列
          if (preIndex == -1 || ret[preIndex][key] != item[key]) {
            // 记录每个key对应的所有值以及其起始索引和出现次数
            // collection = {
            //     "name": {
            //         "Jim#0": {
            //             "firstIndex": 0,
            //             "count": 1
            //         }
            //     }
            // }
            collection[key][`${item[key]}#${i}`] = {
              firstIndex: i,
              count: 1,
            };
            // 标注该列的起源index
            item.source[key] = i;
          } else {
            // 通过上一项找到起源index
            let source = ret[preIndex].source[key];
            item.source[key] = source;
            // 合并该列的行数加1
            collection[key][`${item[key]}#${source}`].count += 1;
          }
        }
        preIndex = i;
      }
      console.log(collection);
      for (let key in collection) {
        // items = {
        //     "Jim#0": {
        //         "firstIndex": "0",
        //         "count": 3
        //     },
        //     "Jon#3": {
        //         "firstIndex": "3",
        //         "count": 1
        //     }
        // }
        let items = collection[key];
        for (let itemkey in items) {
          // value = {
          //     "firstIndex": "0",
          //     "count": 3
          // }
          let value = items[itemkey];
          // 根据记录的起始索引设置该项的mergeRow
          // {
          //     "name": "Jim",
          //     "age": 18,
          //     "address": "Sydney",
          //     "date": "2016-10-03",
          //     "mergeRow": {
          //         "address": 1,
          //         "age": 1,
          //         "date": 1,
          //         "name": 3
          //     }
          // }
          if (!ret[value.firstIndex].mergeRow) {
            ret[value.firstIndex].mergeRow = {};
          }
          ret[value.firstIndex].mergeRow[key] = value.count;
        }
      }
      console.log(ret);
      return ret;
    },
    handleSpan({ row, column, rowIndex, columnIndex }) {
      if (row.mergeRow) {
        // 忽略合并该行此列
        if (
          this.ignoreMergeRow &&
          this.ignoreMergeRow.indexOf(column.key) >= 0
        ) {
          return {
            rowspan: 1,
            colspan: 1,
          };
        }
        // 存在此列的key，则该行此列应显示，向下合并此列的几行（包括自己）则取决于其值
        if (row.mergeRow[column.key]) {
          return {
            rowspan: row.mergeRow[column.key],
            colspan: 1,
          };
        } else {
          // 说明该行此列应被在此之上的行合并，rowspan和colspan设置为0，不予显示
          return {
            rowspan: 0,
            colspan: 0,
          };
        }
      }
    },
  },
  mounted() {
    let data = [
      {
        name: "Jim",
        age: 18,
        address: "Sydney",
        date: "2016-10-03",
      },
      {
        name: "Jim",
        age: 24,
        address: "London",
        date: "2016-10-01",
      },
      {
        name: "Jim",
        age: 30,
        address: "Sydney",
        date: "2016-10-01",
      },
      {
        name: "Jon",
        age: 26,
        address: "Sydney",
        date: "2016-10-04",
      },
    ];
    this.data5 = this.handleMergeRow(data);
  },
};
</script>
 
<style>
</style>