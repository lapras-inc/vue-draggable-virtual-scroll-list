declare module 'vue-virtual-scroll-list' {
  import { VueConstructor, CreateElement, VNode } from 'vue'

  interface VirtualList extends VueConstructor {
    options: {
      methods: {
        [key: string]: any
        getRenderSlots: (h: CreateElement) => Array<VNode>
      }
    }
  }

  export default VirtualList
  export const VirtualList: VirtualList
}
