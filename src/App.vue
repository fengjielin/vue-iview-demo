<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link> | 
      <router-link to="/20210706">20210706</router-link> | 
      <router-link to="/20210708">20210708</router-link> | 
      <router-link to="/courseInfo">课程信息管理</router-link> | 
      <router-link to="/courseArrangement">排课条件设置</router-link> | 
      <router-link to="/courseApplication">调课申请审核</router-link> | 
      <router-link to="/classroomApplication">课室借用审核</router-link> |
      <router-link to="/classSchedule">课程表</router-link><br>
      <router-link to="/workloadStatistics">教师工作量统计</router-link> |

    </div>
    <router-view/>
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height:100%;
  background-color: #F3F8FF;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
