<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link> |
      <router-link to="/a">A</router-link> |
      <br>
      <router-link to="/20210706">关联行政班</router-link> | 
      <router-link to="/20210708">行政班管理</router-link> | 
      <router-link to="/courseInfo">课程信息管理</router-link> | 
      <router-link to="/courseArrangement">排课条件设置</router-link> | 
      <router-link to="/courseApplication">调课申请审核</router-link> | 
      <router-link to="/classroomApplication">课室借用审核</router-link> |
      <router-link to="/classSchedule">课程表</router-link>
      <br>
      <router-link to="/workloadStatistics">教师工作量统计</router-link> |
      <router-link to="/courseRecord">调课记录</router-link>
      <br>
      <router-link to="/classScheduleOverview">课表概览</router-link> | 
      <router-link to="/mySchedule">我的课表</router-link>

    </div>
    <router-view/>
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  height:100%;
  background-color: #F3F8FF;
}

#nav {
  padding: 30px;
  text-align: center;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
