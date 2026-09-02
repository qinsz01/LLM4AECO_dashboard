from pathlib import Path


def replace_once(path, old, new):
    p = Path(path)
    text = p.read_text(encoding='utf-8')
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f'{path}: expected one match, found {count}')
    p.write_text(text.replace(old, new, 1), encoding='utf-8')


path = 'js/operation-analysis.js'
replace_once(
    path,
    "    function percent(value) {\n        return (Number(value || 0) * 100).toFixed(1) + '%';\n    }\n",
    "    function percent(value) {\n        return (Number(value || 0) * 100).toFixed(1) + '%';\n    }\n\n"
    "    function chartLabel(kind, key) {\n"
    "        var label = labelFor(kind, key);\n"
    "        var wrapped = isZh() ? {\n"
    "            '学习/工程化编码': '学习/工程化\\n编码',\n"
    "            generation_parameterization: '生成与\\n参数化',\n"
    "            analysis_compliance_diagnosis: '分析、合规\\n与诊断',\n"
    "            retrieval_alignment: '检索与对齐',\n"
    "            '施工管理与安全': '施工管理\\n与安全',\n"
    "            'BIM检索与管理': 'BIM检索\\n与管理',\n"
    "            '结构设计与分析': '结构设计\\n与分析',\n"
    "            '规范与合规检查': '规范与\\n合规检查',\n"
    "            '设计优化与生成': '设计优化\\n与生成',\n"
    "            '环境与碳评估': '环境与\\n碳评估'\n"
    "        } : {\n"
    "            '学习/工程化编码': 'Learned/engineered\\ncodes',\n"
    "            generation_parameterization: 'Generation and\\nparameterization',\n"
    "            analysis_compliance_diagnosis: 'Analysis, compliance,\\nand diagnosis',\n"
    "            retrieval_alignment: 'Retrieval and alignment',\n"
    "            '施工管理与安全': 'Construction management\\nand safety',\n"
    "            'BIM检索与管理': 'BIM retrieval and\\nmanagement',\n"
    "            '结构设计与分析': 'Structural analysis\\nand design',\n"
    "            '规范与合规检查': 'Regulatory compliance\\nchecking',\n"
    "            '设计优化与生成': 'Design generation\\nand optimization',\n"
    "            '环境与碳评估': 'Environmental and\\ncarbon assessment'\n"
    "        };\n"
    "        return wrapped[key] || label;\n"
    "    }\n"
)
replace_once(path, '            opacity: significant ? 0.72 : 0.24,', '            opacity: significant ? 0.74 : 0.16,')
replace_once(
    path,
    "            tooltip: {\n                trigger: 'item',\n                confine: true,\n                formatter: makeTooltip\n            },\n            series: [{\n",
    "            tooltip: {\n                trigger: 'item',\n                confine: true,\n                formatter: makeTooltip\n            },\n"
    "            graphic: [\n"
    "                {\n"
    "                    type: 'text', left: '6%', top: 0,\n"
    "                    style: {\n"
    "                        text: isZh() ? '数据表征' : 'REPRESENTATION',\n"
    "                        font: '600 10px Arial', fill: '#868e96'\n"
    "                    }\n"
    "                },\n"
    "                {\n"
    "                    type: 'text', left: '43%', top: 0,\n"
    "                    style: {\n"
    "                        text: isZh() ? '数据处理操作' : 'DATA-PROCESSING OPERATION',\n"
    "                        font: '600 10px Arial', fill: '#868e96'\n"
    "                    }\n"
    "                },\n"
    "                {\n"
    "                    type: 'text', right: '6%', top: 0,\n"
    "                    style: {\n"
    "                        text: isZh() ? 'AECO任务类别' : 'AECO TASK CATEGORY',\n"
    "                        font: '600 10px Arial', fill: '#868e96'\n"
    "                    }\n"
    "                }\n"
    "            ],\n"
    "            series: [{\n"
)
replace_once(
    path,
    "                left: 12,\n                right: 12,\n                top: 18,\n                bottom: 20,\n                nodeWidth: 15,\n                nodeGap: 8,\n",
    "                left: '15%',\n                right: '21%',\n                top: 34,\n                bottom: 18,\n                nodeWidth: 15,\n                nodeGap: 9,\n"
)
replace_once(
    path,
    "                    fontSize: 11,\n                    formatter: function (params) {\n                        var parsed = parseNodeName(params.name);\n                        var kind = parsed.kind === 'repr'\n                            ? 'representation'\n                            : parsed.kind === 'op' ? 'operation' : 'task';\n                        return labelFor(kind, parsed.key) + '\\n(n=' + params.data.paperTotal + ')';\n                    }\n",
    "                    fontSize: 11,\n                    lineHeight: 14,\n                    formatter: function (params) {\n                        var parsed = parseNodeName(params.name);\n                        var kind = parsed.kind === 'repr'\n                            ? 'representation'\n                            : parsed.kind === 'op' ? 'operation' : 'task';\n                        return chartLabel(kind, parsed.key) + '\\n(n=' + params.data.paperTotal + ')';\n                    }\n"
)
replace_once(
    path,
    "                levels: [\n                    { depth: 0, label: { position: 'right' } },\n                    { depth: 1, label: { position: 'right' } },\n                    { depth: 2, label: { position: 'left' } }\n                ]\n",
    "                levels: [\n                    { depth: 0, label: { position: 'left', align: 'right' } },\n                    { depth: 1, label: { position: 'right', align: 'left' } },\n                    { depth: 2, label: { position: 'right', align: 'left' } }\n                ]\n"
)

replace_once(
    'css/operation-analysis.css',
    ".chart-card-wide {\n    grid-column: 1 / -1;\n}\n\n.chart-container-association {\n    height: 560px;\n}\n",
    ".chart-card-wide {\n    grid-column: 1 / -1;\n    overflow-x: auto;\n}\n\n.chart-container-association {\n    height: 620px;\n    min-width: 1080px;\n}\n"
)
replace_once(
    'css/operation-analysis.css',
    "    .chart-container-association {\n        height: 720px;\n    }\n",
    "    .chart-container-association {\n        height: 720px;\n        min-width: 1080px;\n    }\n"
)
