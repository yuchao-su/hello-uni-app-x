<template>
  <view class="uni-collapse-item">
    <view class="uni-collapse-item__title" @click="openCollapse(!is_open)">
      <text class="uni-collapse-item__title-text" :class="{'is-disabled':disabled,'open--active':is_open}">{{title}}</text>
      <view class="down_arrow" :class="{'down_arrow--active': is_open}"></view>
    </view>
    <view ref="boxRef" class="uni-collapse-item__content" :class="{'box-open--active':is_open}">
      <view ref="contentRef" class="uni-collapse-item__content-box" :class="{'content-open--active':box_is_open}">
       <slot></slot>
      </view>
    </view>
  </view>
</template>

<script lang="uts">
  import { $dispatch } from './util.uts'
  export default {
    name: "UniCollapseItem",
    props: {
      // 列表标题
      title: {
        type: String,
        default: ''
      },
      open: {
        type: Boolean,
        default: false
      },
      disabled: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        height: 0,
        is_open: this.open as boolean,
        box_is_open: this.open as boolean,
        boxNode: null as UniElement | null,
        contentNode: null as UniElement | null,
      };
    },
    watch: {
      open(value : boolean) {
        // this.is_open = value
        if (this.boxNode != null) {
          this.openCollapse(value)
        }
      }
    },
    created() {
      $dispatch(this, 'UniCollapse', 'init', this)
    },
    mounted() {
      this.boxNode = this.$refs['boxRef'] as UniElement;
      this.contentNode = this.$refs['contentRef'] as UniElement;
      // this.openCollapse(this.open)
    },
    methods: {
      // 开启或关闭折叠面板
      openCollapse(open : boolean) {
        if (this.disabled) return
        // 关闭其他已打开
        $dispatch(this, 'UniCollapse', 'cloceAll')
        this.is_open = open
        this.openOrClose(open)
      },
      openOrClose(open : boolean) {
        // #ifdef MP-WEIXIN
        setTimeout(() => {
          this.box_is_open = open
        }, 10)
        // #endif
        // #ifndef MP-WEIXIN
        const boxNode = this.boxNode?.style!;
        const contentNode = this.contentNode?.style!;
        let hide = open ? 'flex' : 'none';
        const opacity = open ? "1" : "0"
        let ani_transform = open ? 'translateY(0)' : 'translateY(-100%)';
        boxNode.setProperty('display', hide);
        this.$nextTick(() => {
          setTimeout(() => {
            contentNode.setProperty('transform', ani_transform);
            contentNode.setProperty('opacity', opacity);
          }, 10)
        })
        // #endif
      }
    }
  }
</script>

<style>
  /* .uni-collapse-item {
    background-color: #fff;
  } */

  .uni-collapse-item .uni-collapse-item__title {
    flex-direction: row;
    align-items: center;
    padding: 12px 18px;
    background-color: #fff;
  }

  .uni-collapse-item .down_arrow {
    width: 8px;
    height: 8px;
    transform: rotate(45deg);
    border-right: 1px #999 solid;
    border-bottom: 1px #999 solid;
    margin-top: -3px;
    transition-property: transform;
    transition-duration: 0.2s;
  }

  .uni-collapse-item .down_arrow--active {
    transform: rotate(-135deg);
    margin-top: 0px;
  }

  .uni-collapse-item .uni-collapse-item__title-text {
    flex: 1;
    color: #000;
    font-size: 14px;
    font-weight: 400;
  }

  .uni-collapse-item .open--active {
    /* background-color: #f0f0f0; */
    color: #bbb;
  }

  .uni-collapse-item .is-disabled {
    color: #999;
  }

  .uni-collapse-item .uni-collapse-item__content {
    display: none;
    position: relative;
    overflow: hidden;
  }

  .uni-collapse-item .box-open--active {
    display: flex;
  }

  .uni-collapse-item .uni-collapse-item__content-box {
    width: 100%;
    transition-property: transform, opacity;
    transition-duration: 0.2s;
    transform: translateY(-100%);
    opacity: 0;
  }
  /* #ifdef MP-WEIXIN */
  .uni-collapse-item .content-open--active {
    transform: translateY(0%);
    opacity: 1;
  }
  /* #endif */
</style>
