<template>
  <div>
    <el-table v-loading="loading" :data="playlist" stripe>
      <el-table-column type="index" width="50"></el-table-column>
      <el-table-column label="封面" width="100">
        <template slot-scope="scope">
          <img :src="scope.row.picUrl" alt height="50" />
        </template>
      </el-table-column>
      <el-table-column prop="name" label="名称"></el-table-column>
      <el-table-column prop="copywriter" label="描述"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button size="mini" @click="onEdit(scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="onDel(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 确认删除的对话框 -->
    <el-dialog title="提示" :visible.sync="delDialogVisible" width="30%">
      <span>确定删除该歌单吗</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="delDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="doDel">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { fetchList, delPlaylist } from '@/api/playlist'
import scroll from '@/utils/scroll'
export default {
  data() {
    return {
      playlist: [],
      count: 50,
      loading: false,
      delDialogVisible: false,
      delId: -1
    }
  },
  created() {
    this.getList()
  },
  mounted() {
    scroll.start(this.getList)
  },
  methods: {
    onEdit(row) {
      this.$router.push(`/playlist/edit/${row._id}`)
    },
    onDel(row) {
      this.delDialogVisible = true
      this.delId = row._id
    },
    doDel() {
      this.delDialogVisible = false
      delPlaylist({
        _id: this.delId
      }).then(res => {
        if (res.data.deleted === 1) {
          this.$message({
            message: '删除成功',
            type: 'success'
          })
          this.playlist = []
          scroll.isEnd = false
          this.getList()
        } else {
          this.$message.error('删除失败')
        }
      })
    },
    getList() {
      this.loading = true
      fetchList({
        start: this.playlist.length,
        count: this.count
      }).then(res => {
        const result = res.data
        this.playlist = this.playlist.concat(result)
        if (result.length < this.count) {
          scroll.end()
        }
        this.loading = false
      })
    }
  }
}
</script>

<style>

</style>
