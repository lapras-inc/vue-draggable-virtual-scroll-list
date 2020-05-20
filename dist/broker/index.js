var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component, Inject, Prop, Watch } from 'vue-property-decorator';
import { Item, Slot } from '../components/Item';
import { instructionNames as draggableEvents, } from './draggable-policy';
import VirtualScrollListPolicy from './virtual-scroll-list-policy';
export var SortableEvents;
(function (SortableEvents) {
    SortableEvents[SortableEvents["start"] = 0] = "start";
    SortableEvents[SortableEvents["add"] = 1] = "add";
    SortableEvents[SortableEvents["remove"] = 2] = "remove";
    SortableEvents[SortableEvents["update"] = 3] = "update";
    SortableEvents[SortableEvents["end"] = 4] = "end";
    SortableEvents[SortableEvents["choose"] = 5] = "choose";
    SortableEvents[SortableEvents["unchoose"] = 6] = "unchoose";
    SortableEvents[SortableEvents["sort"] = 7] = "sort";
    SortableEvents[SortableEvents["filter"] = 8] = "filter";
    SortableEvents[SortableEvents["clone"] = 9] = "clone";
})(SortableEvents || (SortableEvents = {}));
var sortableEvents = Object.values(SortableEvents).filter(function (x) { return typeof x === 'string'; });
export function sortableEventHandlers(context) {
    return sortableEvents.reduce(function (acc, eventName) {
        var _a;
        return (__assign(__assign({}, acc), (_a = {}, _a[eventName] = context.$emit.bind(context, eventName), _a)));
    }, {});
}
var EVENT_TYPE = {
    ITEM: 'item_resize',
    SLOT: 'slot_resize',
};
var SLOT_TYPE = {
    HEADER: 'header',
    FOOTER: 'footer',
};
var NAME = 'virtual-list';
// A fuctory function which will return DraggableVirtualList constructor.
export default function createBroker(VirtualList) {
    var Broker = /** @class */ (function (_super) {
        __extends(Broker, _super);
        function Broker() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.vlsPolicy = new VirtualScrollListPolicy();
            return _this;
        }
        Broker.prototype.onDataSourcesChanged = function (newValue, oldValue) {
            if (newValue.length !== oldValue.length) {
                this.virtual.updateParam('uniqueIds', this.getUniqueIdFromDataSources());
                this.virtual.handleDataSourcesChange();
            }
        };
        Broker.prototype._dataAdaptCondition = function (dataSource) {
            if (!this.itemHidden)
                return true;
            return !this.itemHidden(dataSource);
        };
        Broker.prototype._getRenderSlots = function (h) {
            var slots = [];
            var start = this.disabled ? 0 : this.range.start;
            var end = this.disabled || this.range.end > this.dataSources.length
                ? this.dataSources.length - 1
                : this.range.end;
            var sliceCount = end - start + 1;
            var index = start;
            var activeSlotCount = 0;
            while (index <= this.dataSources.length - 1 &&
                activeSlotCount < sliceCount) {
                var dataSource = this.dataSources[index];
                if (dataSource) {
                    if (this._dataAdaptCondition(dataSource))
                        activeSlotCount++;
                    slots.push(h(Item, {
                        class: typeof this.itemClass === 'function'
                            ? this.itemClass(dataSource)
                            : this.itemClass,
                        props: {
                            tag: this.itemTag,
                            event: EVENT_TYPE.ITEM,
                            horizontal: this.isHorizontal,
                            uniqueKey: dataSource[this.dataKey],
                            source: dataSource,
                            extraProps: this.extraProps,
                            component: this.dataComponent,
                        },
                    }));
                }
                index++;
            }
            return slots;
        };
        Broker.prototype.getRenderSlots = function (h) {
            var _this = this;
            var _a = this, Draggable = _a.Draggable, DraggablePolicy = _a.DraggablePolicy;
            var slots = this._getRenderSlots(h);
            var draggablePolicy = new DraggablePolicy(this.dataKey, this.dataSources, this.range);
            if (this.vlsPolicy.draggingVNode) {
                // ドラッグ中の要素を vls に差し込む
                slots.splice(this.vlsPolicy.draggingIndex, 1, this.vlsPolicy.draggingVNode);
            }
            return [
                h(Draggable, {
                    props: {
                        value: this.dataSources,
                        // policy will find the real item from x.
                        clone: function (x) { return draggablePolicy.findRealItem(x); },
                    },
                    on: __assign(__assign({ 
                        // Convert Draggable's change events to input events.
                        change: function (e) {
                            if (draggableEvents.some(function (n) { return n in e; })) {
                                _this.$emit('input', draggablePolicy.updatedSources(e, _this.vlsPolicy.draggingRealIndex));
                            }
                        } }, sortableEventHandlers(this)), { start: function (e) {
                            _this.vlsPolicy.onDragStart(e, _this.range, slots);
                            _this.$emit('start', e);
                        }, end: function (e) {
                            _this.vlsPolicy.onDragEnd();
                            _this.$emit('end', e);
                        } }),
                    attrs: this.$attrs,
                }, slots),
            ];
        };
        Broker.prototype._calcPadding = function () {
            if (this.disabled)
                return 0;
            if (this.isHorizontal)
                return "0px " + this.range.padBehind + "px 0px " + this.range.padFront + "px";
            if (this.disableComputeMargin)
                return 0;
            return this.range.padFront + "px 0px " + this.range.padBehind + "px";
        };
        Broker.prototype.render = function (h) {
            var _a = this.$slots, header = _a.header, footer = _a.footer;
            var padding = this._calcPadding();
            return h(this.rootTag, {
                ref: 'root',
                on: {
                    '&scroll': this.onScroll,
                },
            }, [
                // header slot.
                header
                    ? h(Slot, {
                        class: this.headerClass,
                        props: {
                            tag: this.headerTag,
                            event: EVENT_TYPE.SLOT,
                            uniqueKey: SLOT_TYPE.HEADER,
                        },
                    }, header)
                    : null,
                // main list.
                h(this.wrapTag, {
                    class: this.wrapClass,
                    attrs: {
                        role: 'group',
                    },
                    style: {
                        padding: padding,
                    },
                }, this.getRenderSlots(h)),
                // footer slot.
                footer
                    ? h(Slot, {
                        class: this.footerClass,
                        props: {
                            tag: this.footerTag,
                            event: EVENT_TYPE.SLOT,
                            uniqueKey: SLOT_TYPE.FOOTER,
                        },
                    }, footer)
                    : null,
            ]);
        };
        __decorate([
            Prop()
        ], Broker.prototype, "size", void 0);
        __decorate([
            Prop()
        ], Broker.prototype, "keeps", void 0);
        __decorate([
            Prop()
        ], Broker.prototype, "dataKey", void 0);
        __decorate([
            Prop()
        ], Broker.prototype, "dataSources", void 0);
        __decorate([
            Prop()
        ], Broker.prototype, "dataComponent", void 0);
        __decorate([
            Prop({ default: '' })
        ], Broker.prototype, "itemClass", void 0);
        __decorate([
            Prop()
        ], Broker.prototype, "disabled", void 0);
        __decorate([
            Prop()
        ], Broker.prototype, "itemHidden", void 0);
        __decorate([
            Prop({ default: 'div' })
        ], Broker.prototype, "itemTag", void 0);
        __decorate([
            Prop()
        ], Broker.prototype, "extraProps", void 0);
        __decorate([
            Prop()
        ], Broker.prototype, "disableComputeMargin", void 0);
        __decorate([
            Inject()
        ], Broker.prototype, "Draggable", void 0);
        __decorate([
            Inject()
        ], Broker.prototype, "DraggablePolicy", void 0);
        __decorate([
            Watch('dataSources')
        ], Broker.prototype, "onDataSourcesChanged", null);
        Broker = __decorate([
            Component
        ], Broker);
        return Broker;
    }(VirtualList));
    return Broker;
}
// Returns handlers which propagate sortable's events.
//# sourceMappingURL=index.js.map