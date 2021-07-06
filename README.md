# vue-iview-test

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

### 2021-07-06
需求：
有两个表格，有一个json文件保存着数据，现在需要从第一个表格中显示json中的数据，然后在第一个表格中进行多项选择，选择完数据后，点击关联按钮，可以将选中的数据从第一个表格转移到第二个表格中，之后再点击保存按钮，将第二表格中的数据给提交到服务端。

要求使用 iview

思路：
json数据是数组形式的，首先需要将第一个表格中的数据给保存出来，然后将选中的数据进行遍历，获取选中数据在第一个表格数据中的下标值，再然后，通过 splice 将数据从第一个表格中删除掉，然后在循环往第二个表格中 push 进之前选中的数据

findIndex(item0 =>item0.id === item.id); 获取对象数组中有个值的下标
splice(index,1); 删除下标为index的这一项
