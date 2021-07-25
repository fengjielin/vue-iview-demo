<template>
  <div class="about">
    <div class="teacherScheduleBox">
      <div class="content">
        <Table
          border
          :columns="teacherScheduleColumns"
          :data="allSection"
          style="margin: 32px 24px 24px"
        ></Table>
      </div>
      <div class="adjustCourse">
        <div class="title">调课操作信息</div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      teacherScheduleColumns: [
        {
          title: "节次",
          key: "name",
          align: "center",
          width: 98,
          className: "codeStyle",
        },
        {
          title: "周一",
          key: "week1",
          align: "center",
          width: 182,
        },
        {
          title: "周二",
          key: "week2",
          width: 182,
          align: "center",
        },
        {
          title: "周三",
          key: "week3",
          width: 182,
          align: "center",
        },
        {
          title: "周四",
          key: "week4",
          width: 182,
          align: "center",
        },
        {
          title: "周五",
          key: "week5",
          width: 182,
          align: "center",
        },
        {
          title: "周六",
          key: "week6",
          width: 182,
          align: "center",
        },
        {
          title: "周日",
          key: "week7",
          width: 182,
          align: "center",
        },
      ],
      allSection: [
        {
          id: 1,
          code: "1",
          name: "第一节",
          begintime: "00:59",
          endtime: "09:00",
        },
        {
          id: 2,
          code: "2",
          name: "第二节",
          begintime: "09:30:00",
          endtime: "10:30:00",
        },
        {
          id: 3,
          code: "3",
          name: "第三节",
          begintime: "11:00",
          endtime: "12:00",
        },
        {
          id: 4,
          code: "4",
          name: "第四节",
          begintime: "05:00",
          endtime: "05:30",
        },
        {
          id: 5,
          code: "5",
          name: "第五节",
          begintime: "03:30:00",
          endtime: "04:30:30",
        },
        {
          id: 6,
          code: "6",
          name: "第六节",
          begintime: "05:00:00",
          endtime: "06:00:00",
        },
      ],
    };
  },
};
</script>

<style>
.about {
  width: 100%;
  padding: 20px 80px 0;
  height: 100%;
  background-color: #f3f8ff;
}

.about .content {
  /* padding: 24px; */
  padding-top: 32px;
  width:1428px;
  height: 754px;
  background-color: #fff;
  box-shadow: 0px 4px 8px 0px rgba(27, 129, 255, 0.1);
  overflow: hidden;
}

.about .teacherScheduleBox {
  display: flex;
}

.about .teacherScheduleBox .adjustCourse {
  width: 300px;
  height: 506px;
  background-color: #fff;
  margin-left: 32px;
  box-shadow: 0px 4px 8px 0px rgba(27, 129, 255, 0.1);
  flex-shrink:0;
}

.about .teacherScheduleBox .adjustCourse .title {
  background-color: #ff9d76;
  width: 100%;
  height: 48px;
  line-height: 48px;
  color: #fff;
}
</style>
