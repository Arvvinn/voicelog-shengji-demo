# 本轮设计参考与应用记录

研究日期：2026-09-26。以下用于指导本轮实现，不作为可用性或算法效果证据。

| 原始来源 | 本轮采用 | 未采用/不能推断 |
|---|---|---|
| https://github.com/emilkowalski/skills | 操作触达、短而可中断的动效、transform/opacity、hover条件、减少动态效果 | 不能因为使用同一原则就保证实际手机效果 |
| https://help.obsidian.md/plugins/graph | 全局/局部图、邻域强调、节点导航与过滤思路 | 没有复制Obsidian专有代码；图由Cytoscape实现 |
| https://js.cytoscape.org/ | 图布局、真实拖动/平移/缩放与选择 | 不是仅用SVG画固定连线；仍需实际手势与设备测试 |
| https://github.com/cytoscape/cytoscape.js/blob/v3.33.1/LICENSE | MIT许可与分发要求 | 图谱技术不证明里面的关系为因果 |
| https://docs.typesafe.ai/introduction | State/Question与Choice/Score/Noul形式的可替换判别层 | 未调用API，未测中文准确度，不重复营销性能数字 |
| 用户提供的母版、甘特图与关系图参考 | 同一配色/字体体系；竖向人物时间与分块一天；小邻域到完整图 | 参考截图是布局依据，不是我们已有数据或真实识别结果 |

实际交付库来源与版本另见vendor/README.md。用户提供的真实产品图仅作缩放与格式转换，没有重新设计硬件外观。
