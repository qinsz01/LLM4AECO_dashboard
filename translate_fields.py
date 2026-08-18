#!/usr/bin/env python3
"""
Add English translations (taskEn, inputDataEn) to all paper JSON files.
"""

import json
import os

# Complete translation mapping for all 123 unique task values
TASK_TRANSLATIONS = {
    "建筑能耗预测与优化": "Building energy prediction and optimization",
    "RASE标注与规范文本结构化": "RASE tagging and regulatory text structuring",
    "综述": "Review/Survey",
    "热舒适度监测": "Thermal comfort monitoring",
    "冲突管理": "Conflict management",
    "设计沟通": "Design communication",
    "运维管理需求定义": "O&M management requirement definition",
    "图像描述": "Image captioning",
    "信息管理": "Information management",
    "信息检索/问答支持": "Information retrieval / Q&A support",
    "活动识别/进度监测": "Activity recognition / progress monitoring",
    "能力评估": "Capability assessment",
    "改造决策": "Retrofit decision-making",
    "结构分析": "Structural analysis",
    "故障诊断、运维问答、能耗预测": "Fault diagnosis, O&M Q&A, energy prediction",
    "概念设计生成": "Conceptual design generation",
    "设计理论": "Design theory",
    "几何参数优化": "Geometric parameter optimization",
    "故障诊断": "Fault diagnosis",
    "文本生成BIM模型": "Text-to-BIM model generation",
    "设计协调": "Design coordination",
    "检验工作包自动生成": "Automated inspection work package generation",
    "BIM命令推荐": "BIM command recommendation",
    "自然语言生成BIM模型": "Natural language to BIM model generation",
    "能耗建模": "Energy modeling",
    "BIM模型交互与管理": "BIM model interaction and management",
    "BIM-to-BEM语义增强": "BIM-to-BEM semantic enrichment",
    "规范解释": "Regulation interpretation",
    "综合设计框架": "Integrated design framework",
    "成本估算与投标定价": "Cost estimation and bid pricing",
    "ESG数据管理": "ESG data management",
    "隐含碳评估": "Embodied carbon assessment",
    "面向制造与装配的设计（DfMA）": "Design for manufacture and assembly (DfMA)",
    "施工质量合规检查": "Construction quality compliance checking",
    "施工计划约束信息问答": "Construction planning constraint Q&A",
    "自动合规检查": "Automated compliance checking",
    "翻新措施诊断": "Renovation measure diagnosis",
    "基础设施状况数据语义增强": "Infrastructure condition data semantic enrichment",
    "建筑能源系统控制设计": "Building energy system control design",
    "建筑细部设计": "Architectural detailing",
    "建成环境审计": "Built environment auditing",
    "BIM语义增强（构件功能需求推断）": "BIM semantic enrichment (component functional requirement inference)",
    "缺陷管理问答": "Defect management Q&A",
    "震后建筑结构损伤评估": "Post-earthquake structural damage assessment",
    "土方工程量估算": "Earthwork quantity estimation",
    "建筑机器人任务规划": "Construction robot task planning",
    "设施管理信息检索": "Facility management information retrieval",
    "岩土工程分析、代码生成与工程工作流自动化": "Geotechnical analysis, code generation and engineering workflow automation",
    "安全监测": "Safety monitoring",
    "虚拟建筑模型自动构建": "Automated virtual building model construction",
    "基于智能数字孪生的运维服务（虚拟建模与校准、虚拟传感、传感器校准、本体解读、知识提取）": "Intelligent digital twin-based O&M services (virtual modeling & calibration, virtual sensing, sensor calibration, ontology interpretation, knowledge extraction)",
    "建筑使用率预测": "Building occupancy prediction",
    "本体驱动的跨领域知识文档化与知识图谱构建": "Ontology-driven cross-domain knowledge documentation and knowledge graph construction",
    "语义数据查询（NL2SPARQL）": "Semantic data query (NL2SPARQL)",
    "建筑属性识别与描述生成": "Building attribute recognition and caption generation",
    "安全知识问答": "Safety knowledge Q&A",
    "建筑运维信息查询": "Building O&M information query",
    "拆除废弃物预测、室内设计类型分类、平面图分割": "Demolition waste prediction, interior design type classification, floor plan segmentation",
    "PVAC系统控制参数优化": "PVAC system control parameter optimization",
    "BIM空间关系查询": "BIM spatial relationship query",
    "数据检索": "Data retrieval",
    "自然语言到BIM结构化查询转换": "Natural language to BIM structured query conversion",
    "现场检测与分析": "On-site inspection and analysis",
    "疏散安全设计评估": "Evacuation safety design assessment",
    "文本": "Text",
    "隧道掌子面映射与岩体分类": "Tunnel face mapping and rock mass classification",
    "道路检查文本分类": "Road inspection text classification",
    "风险评估与管理": "Risk assessment and management",
    "安全风险评估": "Safety risk assessment",
    "进度追踪": "Progress tracking",
    "结构健康监测（裂缝检测与分割）": "Structural health monitoring (crack detection and segmentation)",
    "有限元仿真替代建模": "Finite element analysis surrogate modeling",
    "环境影响评估": "Environmental impact assessment",
    "建筑设计支持": "Architectural design support",
    "低碳建筑设计": "Low-carbon building design",
    "自动报告生成": "Automated report generation",
    "结构设计优化": "Structural design optimization",
    "平面图生成": "Floor plan generation",
    "能耗与环境参数分析": "Energy and environmental parameter analysis",
    "基于智能数字孪生的运维服务（虚拟建模、故障检测与诊断、信息检索、本体更新）": "Intelligent digital twin-based O&M services (virtual modeling, fault detection & diagnosis, information retrieval, ontology update)",
    "综述+方法论验证": "Review + methodology validation",
    "合同解读": "Contract interpretation",
    "建筑存量材料信息提取与预测": "Building stock material information extraction and prediction",
    "裂缝检测与图像分类": "Crack detection and image classification",
    "能耗改造决策": "Energy retrofit decision-making",
    "进度数据增强与合成数据生成": "Schedule data augmentation and synthetic data generation",
    "知识评估与培训": "Knowledge assessment and training",
    "综述+框架+案例验证": "Review + framework + case validation",
    "结构健康监测与退化预测": "Structural health monitoring and degradation prediction",
    "规范检查/设计验证": "Code compliance checking / design verification",
    "数据质量评估/能耗管理": "Data quality assessment / energy management",
    "信息管理/数据标准化": "Information management / data standardization",
    "环境影响评估/循环经济评估": "Environmental impact assessment / circular economy assessment",
    "规范检查/知识库问答": "Code compliance checking / knowledge base Q&A",
    "能耗管理/能效诊断": "Energy management / energy efficiency diagnosis",
    "进度管理/文档生成": "Schedule management / document generation",
    "环境监测/能耗管理": "Environmental monitoring / energy management",
    "知识问答与决策支持": "Knowledge Q&A and decision support",
    "能耗模型开发": "Energy model development",
    "数据查询与分析": "Data query and analysis",
    "建筑能耗分析与建模Agent框架": "Building energy analysis and modeling agent framework",
    "建筑控制可解释性": "Building control interpretability",
    "合同问答与知识检索": "Contract Q&A and knowledge retrieval",
    "建筑平面图语义分割与无障碍分析": "Architectural floor plan semantic segmentation and accessibility analysis",
    "能耗模型开发与调试": "Energy model development and debugging",
    "能耗异常检测": "Energy anomaly detection",
    "能耗预测/故障诊断/异常检测": "Energy prediction / fault diagnosis / anomaly detection",
    "建筑碳排放优化、HVAC控制策略生成、人机交互": "Building carbon emission optimization, HVAC control strategy generation, human-computer interaction",
    "建筑能源管理与控制策略泛化": "Building energy management and control strategy generalization",
    "结构损伤识别与描述": "Structural damage identification and description",
    "规范解释与代码生成": "Regulation interpretation and code generation",
    "文本分类/命名实体识别": "Text classification / named entity recognition",
    "建筑设计优化": "Architectural design optimization",
    "自动化建筑能耗建模": "Automated building energy modeling",
    "结构设计": "Structural design",
    "规范检查": "Code compliance checking",
    "能耗预测": "Energy consumption prediction",
    "信息检索": "Information retrieval",
    "建筑规范问答": "Building regulation Q&A",
    "BIM信息检索": "BIM information retrieval",
    "建筑性能模拟": "Building performance simulation",
    "规范合规检查": "Code compliance checking",
    "人机协作交互": "Human-robot collaborative interaction",
}

# Complete translation mapping for all 127 unique inputData values
INPUT_DATA_TRANSLATIONS = {
    "时间序列数据": "Time series data",
    "建筑法规文档文本（M2, L2A, BB100）": "Building regulation documents (M2, L2A, BB100)",
    "文献数据（Scopus与Google Scholar）": "Literature data (Scopus & Google Scholar)",
    "BIM模型+传感器数据+外部数据": "BIM models + sensor data + external data",
    "建筑结构数据": "Building structural data",
    "新闻报道": "News articles",
    "客户需求+BIM模型": "Client requirements + BIM models",
    "设计图纸+COBie文档+文本需求": "Design drawings + COBie documents + textual requirements",
    "土木工程和建筑现场图像": "Civil engineering and construction site images",
    "结构化数据库": "Structured databases",
    "混合数据（项目文档：标准、施工方案、合同、会议纪要等）": "Mixed data (project documents: standards, construction plans, contracts, meeting minutes, etc.)",
    "现场图像 + 本体": "On-site images + ontology",
    "建筑设计文档与图像（DWG/DXF/PDF/JPEG/IFC/TXT/SKP）": "Architectural design documents & images (DWG/DXF/PDF/JPEG/IFC/TXT/SKP)",
    "建筑设计规范文本": "Building design code texts",
    "建筑节能改造案例": "Building energy retrofit cases",
    "结构设计参数": "Structural design parameters",
    "自然语言查询、物理参数时序数据、领域知识文档": "Natural language queries, physical parameter time series data, domain knowledge documents",
    "文本（自然语言设计需求描述）": "Text (natural language design requirement descriptions)",
    "文本+用户交互": "Text + user interaction",
    "FEA仿真数据（几何参数与力学响应）": "FEA simulation data (geometric parameters and mechanical responses)",
    "城市建筑数据（多源数据）": "Urban building data (multi-source data)",
    "HVAC系统运行数据": "HVAC system operational data",
    "考古平面图+文本描述": "Archaeological floor plans + textual descriptions",
    "文本（自然语言描述）+图像（结构示意图）": "Text (natural language descriptions) + images (structural diagrams)",
    "用户需求": "User requirements",
    "知识图谱+文本（检验计划、规范文档）": "Knowledge graphs + text (inspection plans, regulatory documents)",
    "BIM软件使用日志（Vectorworks大规模交互日志）": "BIM software usage logs (large-scale Vectorworks interaction logs)",
    "自然语言描述": "Natural language descriptions",
    "自然语言描述/图像": "Natural language descriptions / images",
    "自然语言（文本/语音）": "Natural language (text/speech)",
    "BIM模型": "BIM models",
    "设计需求": "Design requirements",
    "文本（项目描述+专家知识）": "Text (project descriptions + expert knowledge)",
    "BIM模型+环境数据": "BIM models + environmental data",
    "BIM模型+材料设备清单": "BIM models + material & equipment lists",
    "BIM模型+参数化设计+文本（设计规则）": "BIM models + parametric design + text (design rules)",
    "规范文档+自然语言查询": "Regulatory documents + natural language queries",
    "BIM模型+会议记录+施工日志+进度计划": "BIM models + meeting minutes + construction logs + schedules",
    "建筑规范文档": "Building code documents",
    "建筑信息+文本（现状描述）": "Building information + text (current condition descriptions)",
    "关系数据库（桥梁检测数据）+本体文件": "Relational databases (bridge inspection data) + ontology files",
    "语义模型（Brick）": "Semantic models (Brick)",
    "BIM模型+自然语言描述": "BIM models + natural language descriptions",
    "现场图像视频（街景图像）": "On-site images & videos (street view imagery)",
    "BIM模型（低LOD）": "BIM models (low LOD)",
    "文本（缺陷报告）": "Text (defect reports)",
    "图像（结构损伤图片）+ 文本（自然语言问答）": "Images (structural damage photos) + text (natural language Q&A)",
    "文本（自然语言建筑描述+IDF文件示例）": "Text (natural language building descriptions + IDF file examples)",
    "CAD": "CAD",
    "文本（自然语言任务描述）": "Text (natural language task descriptions)",
    "BIM+文本（自然语言查询）": "BIM + text (natural language queries)",
    "文本（文档、手册等）": "Text (documents, manuals, etc.)",
    "文本（自然语言描述）、工程报告、领域知识库（DIGGS Schema）": "Text (natural language descriptions), engineering reports, domain knowledge bases (DIGGS Schema)",
    "现场图像视频 + BIM": "On-site images & videos + BIM",
    "BIM模型+本体数据+运行数据": "BIM models + ontology data + operational data",
    "文本（职业类型+时间表描述）": "Text (occupancy types + schedule descriptions)",
    "BIM模型/非结构化文本": "BIM models / unstructured text",
    "Brick Schema语义模型（TTL格式）+自然语言问题": "Brick Schema semantic models (TTL format) + natural language questions",
    "街景图像+建筑几何数据": "Street view imagery + building geometric data",
    "安全规范文本+专业书籍+考试题库": "Safety regulation texts + professional books + exam question banks",
    "模拟模型（IDF文件）+气象数据（EPW）+自然语言": "Simulation models (IDF files) + weather data (EPW) + natural language",
    "传感器数据+查询文本": "Sensor data + query text",
    "住宅室内照片、建筑平面图": "Residential interior photos, architectural floor plans",
    "传感器数据（温度、太阳辐射、PV功率）+仿真运行指标（PPD、PMV、成本）": "Sensor data (temperature, solar radiation, PV power) + simulation metrics (PPD, PMV, cost)",
    "BIM模型+自然语言查询": "BIM models + natural language queries",
    "自然语言查询+BIM结构化查询语句对": "Natural language queries + BIM structured query statement pairs",
    "现场图像视频+点云": "On-site images & videos + point clouds",
    "混合数据（CAD图纸+设计文档+传感器数据）": "Mixed data (CAD drawings + design documents + sensor data)",
    "CAD建筑平面图": "CAD architectural floor plans",
    "文本化": "Textualized data",
    "BIM模型+规范文档": "BIM models + regulatory documents",
    "现场图像（360°全景图像）": "On-site images (360-degree panoramic images)",
    "文本（道路检查评论）": "Text (road inspection comments)",
    "文本（项目案例描述）": "Text (project case descriptions)",
    "文本（风险描述）": "Text (risk descriptions)",
    "混合数据（施工文档、现场图像视频、BIM）": "Mixed data (construction documents, on-site images & videos, BIM)",
    "无人机图像+AIGC合成图像+公开裂缝数据集": "Drone images + AIGC synthetic images + public crack datasets",
    "FEA仿真数据（位移、应力、应变）、足底压力传感器数据": "FEA simulation data (displacement, stress, strain), foot pressure sensor data",
    "混合数据（BIM、LCA数据库）": "Mixed data (BIM, LCA database)",
    "文本（模式语言描述）": "Text (pattern language descriptions)",
    "混合数据（BIM、LCA数据库、设计参数）": "Mixed data (BIM, LCA database, design parameters)",
    "现场图像": "On-site images",
    "文本（设计要求）+建筑CAD图纸": "Text (design requirements) + architectural CAD drawings",
    "文本（用户需求）": "Text (user requirements)",
    "IDF文件（EnergyPlus模型）+文本（自然语言指令）": "IDF files (EnergyPlus models) + text (natural language instructions)",
    "施工进度数据+OSHA安全隐患图像": "Construction schedule data + OSHA safety hazard images",
    "规范文档+合同文本": "Regulatory documents + contract texts",
    "建筑能效证书（EPC）文本+建筑登记数据": "Building energy performance certificate (EPC) texts + building registry data",
    "合成图像+现场图像": "Synthetic images + on-site images",
    "规范文本+计算规则脚本": "Regulatory texts + calculation rule scripts",
    "住宅建筑参数+能耗模拟数据+改造成本数据": "Residential building parameters + energy simulation data + retrofit cost data",
    "施工文档+进度计划": "Construction documents + schedules",
    "规范文档+施工手册": "Regulatory documents + construction manuals",
    "文本（自然语言/建筑参数描述）": "Text (natural language / building parameter descriptions)",
    "建筑合同文件+行业文献": "Building contract documents + industry literature",
    "传感器数据+仿真数据+材料试验数据": "Sensor data + simulation data + material test data",
    "混合数据（MEP原理图图像 + BIM）": "Mixed data (MEP schematic images + BIM)",
    "传感器数据（时间序列）": "Sensor data (time series)",
    "建筑检查报告（非结构化文本）": "Building inspection reports (unstructured text)",
    "文本（EPD文档PDF）": "Text (EPD documents in PDF)",
    "混合数据（非结构化建筑数据）": "Mixed data (unstructured building data)",
    "现场图像视频": "On-site images & videos",
    "混合数据（传感器数据 + BIM + IoT）": "Mixed data (sensor data + BIM + IoT)",
    "混合数据（规范文档 + BIM）": "Mixed data (regulatory documents + BIM)",
    "建筑工程问答数据集+施工规范文档": "Construction engineering Q&A datasets + construction regulatory documents",
    "文本/能耗数据": "Text / energy consumption data",
    "时序数据/语义模型": "Time series data / semantic models",
    "文本描述+CSV数据+PDF文档": "Text descriptions + CSV data + PDF documents",
    "建筑运行时序数据（温度、能耗、气象、occupancy）": "Building operational time series data (temperature, energy, weather, occupancy)",
    "建筑合同文件+法律法规+国家规范": "Building contract documents + laws & regulations + national codes",
    "2D栅格建筑平面图": "2D raster architectural floor plans",
    "文本（自然语言描述）+IDF文件（EnergyPlus模型）": "Text (natural language descriptions) + IDF files (EnergyPlus models)",
    "传感器数据/文本": "Sensor data / text",
    "时序运行数据/故障数据/关联规则": "Time series operational data / fault data / association rules",
    "BIM模拟数据、气象数据、建筑运行参数": "BIM simulation data, weather data, building operational parameters",
    "传感器数据（时间序列）/天气数据/建筑设备参数": "Sensor data (time series) / weather data / building equipment parameters",
    "时间序列数据+文本": "Time series data + text",
    "结构损伤图像+文本描述": "Structural damage images + text descriptions",
    "文本（自然语言查询）": "Text (natural language queries)",
    "文本（施工文档）": "Text (construction documents)",
    "文本/设计参数": "Text / design parameters",
    "自然语言查询+BIM模型": "Natural language queries + BIM models",
    "规范文档": "Regulatory documents",
    "建筑规范文本": "Building regulation texts",
    "文本（自然语言描述）": "Text (natural language descriptions)",
    "传感器数据 + 本体（RDF/Brick Schema） + 运行数据": "Sensor data + ontology (RDF/Brick Schema) + operational data",
    "语音指令与VR控制器输入": "Voice commands & VR controller inputs",
}


def main():
    papers_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "papers")

    # First pass: check for any missing translations
    missing_tasks = set()
    missing_inputs = set()

    for filename in sorted(os.listdir(papers_dir)):
        if not filename.endswith(".json"):
            continue
        filepath = os.path.join(papers_dir, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)

        task = data.get("task", "")
        input_data = data.get("inputData", "")

        if task and task not in TASK_TRANSLATIONS:
            missing_tasks.add(task)
        if input_data and input_data not in INPUT_DATA_TRANSLATIONS:
            missing_inputs.add(input_data)

    if missing_tasks:
        print("WARNING: Missing task translations:")
        for t in sorted(missing_tasks):
            print(f"  '{t}'")
    if missing_inputs:
        print("WARNING: Missing inputData translations:")
        for i in sorted(missing_inputs):
            print(f"  '{i}'")

    if missing_tasks or missing_inputs:
        print(f"\nMissing {len(missing_tasks)} task translations and {len(missing_inputs)} inputData translations.")
        print("Please add them before proceeding.")
        return

    # Second pass: apply translations
    updated_count = 0
    skipped_count = 0

    for filename in sorted(os.listdir(papers_dir)):
        if not filename.endswith(".json"):
            continue
        filepath = os.path.join(papers_dir, filename)

        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)

        task = data.get("task", "")
        input_data = data.get("inputData", "")

        if not task and not input_data:
            skipped_count += 1
            continue

        task_en = TASK_TRANSLATIONS.get(task, "")
        input_data_en = INPUT_DATA_TRANSLATIONS.get(input_data, "")

        data["taskEn"] = task_en
        data["inputDataEn"] = input_data_en

        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

        updated_count += 1

    print(f"Updated {updated_count} papers, skipped {skipped_count}.")

    # Verification pass
    missing_task_en = 0
    missing_input_en = 0
    total = 0

    for filename in sorted(os.listdir(papers_dir)):
        if not filename.endswith(".json"):
            continue
        filepath = os.path.join(papers_dir, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
        total += 1

        if data.get("task") and not data.get("taskEn"):
            missing_task_en += 1
            print(f"  Missing taskEn: {filename}")
        if data.get("inputData") and not data.get("inputDataEn"):
            missing_input_en += 1
            print(f"  Missing inputDataEn: {filename}")

    print(f"\nVerification: {total} total papers")
    print(f"  Missing taskEn: {missing_task_en}")
    print(f"  Missing inputDataEn: {missing_input_en}")

    if missing_task_en == 0 and missing_input_en == 0:
        print("\nAll papers have complete translations!")
    else:
        print("\nSome translations are missing!")


if __name__ == "__main__":
    main()
