<template>
  <div class="classSchedule">
    <Table :columns="columns1" :data="data1"></Table>
  </div>
</template>

<script>
export default {
data(){
  return {
    columns1:[],
    data1:[]
  }  
}
}
</script>

<style>
.classSchedule{
  
}
</style>