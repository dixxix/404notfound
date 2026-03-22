"""Конфиги демо-тестов (синхрон с lib/demo-public-tests.ts)."""

PROF_CONFIG = {
    "demoVersion": 3,
    "questions": [
        {
            "id": "prof_q1",
            "type": "single",
            "text": "Какой тип задач вам даётся легче всего?",
            "required": True,
            "sectionTitle": "Предпочтения",
            "options": [
                {"id": "prof_o1", "text": "Придумывать новое, оформлять идеи", "weight": 3},
                {"id": "prof_o2", "text": "Собирать данные, искать закономерности", "weight": 3},
                {"id": "prof_o3", "text": "Общаться, договариваться, мотивировать", "weight": 3},
                {"id": "prof_o4", "text": "Настраивать, чинить, работать руками / с техникой", "weight": 3},
            ],
        },
        {
            "id": "prof_q2",
            "type": "multiple",
            "text": "Отметьте качества, которые про вас чаще говорят окружающие",
            "required": True,
            "sectionTitle": "Предпочтения",
            "options": [
                {"id": "prof_o5", "text": "Креативность", "weight": 1},
                {"id": "prof_o6", "text": "Ответственность", "weight": 1},
                {"id": "prof_o7", "text": "Эмпатия", "weight": 1},
                {"id": "prof_o8", "text": "Системность", "weight": 1},
                {"id": "prof_o9", "text": "Смелость решений", "weight": 1},
                {"id": "prof_o10", "text": "Терпение к деталям", "weight": 1},
            ],
        },
        {
            "id": "prof_q3",
            "type": "scale",
            "text": "Насколько вам комфортно учиться новым инструментам (программы, оборудование)?",
            "required": True,
            "sectionTitle": "Предпочтения",
            "options": [],
            "scaleMin": 1,
            "scaleMax": 7,
            "scaleMinLabel": "Сложно",
            "scaleMaxLabel": "Легко",
        },
        {
            "id": "prof_q4",
            "type": "single",
            "text": "Какой формат работы вам ближе?",
            "required": True,
            "sectionTitle": "Условия",
            "options": [
                {"id": "prof_o11", "text": "Стабильный офис с коллегами", "weight": 1},
                {"id": "prof_o12", "text": "Гибрид: часть времени дома", "weight": 2},
                {"id": "prof_o13", "text": "Полностью удалённо", "weight": 3},
                {"id": "prof_o14", "text": "Проекты и командировки", "weight": 2},
            ],
        },
        {
            "id": "prof_q5",
            "type": "scale",
            "text": "Насколько важен для вас предсказуемый график (фиксированные часы)?",
            "required": True,
            "sectionTitle": "Условия",
            "options": [],
            "scaleMin": 1,
            "scaleMax": 5,
            "scaleMinLabel": "Не важен",
            "scaleMaxLabel": "Очень важен",
        },
        {
            "id": "prof_q6",
            "type": "number",
            "text": "Сколько часов в неделю вы готовы уделять работе в комфортном режиме? (приблизительно)",
            "required": False,
            "sectionTitle": "Условия",
            "options": [],
            "numberMin": 10,
            "numberMax": 60,
        },
        {
            "id": "prof_q7",
            "type": "multiple",
            "text": "Что для вас важнее в карьере? (несколько вариантов)",
            "required": True,
            "sectionTitle": "Ценности",
            "options": [
                {"id": "prof_o15", "text": "Высокий доход", "weight": 1},
                {"id": "prof_o16", "text": "Смысл и польза для людей", "weight": 1},
                {"id": "prof_o17", "text": "Свобода и автономия", "weight": 1},
                {"id": "prof_o18", "text": "Признание и рост", "weight": 1},
                {"id": "prof_o19", "text": "Безопасность и стабильность", "weight": 1},
            ],
        },
        {
            "id": "prof_q8",
            "type": "single",
            "text": "Через 5 лет вы скорее хотели бы…",
            "required": True,
            "sectionTitle": "Ценности",
            "options": [
                {"id": "prof_o20", "text": "Углубиться в одну узкую специализацию", "weight": 1},
                {"id": "prof_o21", "text": "Управлять людьми или проектами", "weight": 2},
                {"id": "prof_o22", "text": "Пробовать разные роли и направления", "weight": 3},
                {"id": "prof_o23", "text": "Иметь свой бизнес или консалтинг", "weight": 2},
            ],
        },
        {
            "id": "prof_q9",
            "type": "scale",
            "text": "Готовность проходить обучение вне рабочего времени ради карьеры",
            "required": True,
            "sectionTitle": "Развитие",
            "options": [],
            "scaleMin": 1,
            "scaleMax": 5,
            "scaleMinLabel": "Низкая",
            "scaleMaxLabel": "Высокая",
        },
        {
            "id": "prof_q10",
            "type": "number",
            "text": "Сколько лет вы планируете развиваться в выбранной сфере?",
            "required": False,
            "sectionTitle": "Развитие",
            "options": [],
            "numberMin": 0,
            "numberMax": 40,
        },
        {
            "id": "prof_q11",
            "type": "single",
            "text": "В команде вы чаще…",
            "required": True,
            "sectionTitle": "Стиль работы",
            "options": [
                {"id": "prof_o24", "text": "Беру инициативу и веду за собой", "weight": 2},
                {"id": "prof_o25", "text": "Поддерживаю и согласовываю", "weight": 1},
                {"id": "prof_o26", "text": "Работаю автономно в рамках задачи", "weight": 2},
                {"id": "prof_o27", "text": "Предлагаю нестандартные идеи", "weight": 2},
            ],
        },
        {
            "id": "prof_q12",
            "type": "open",
            "text": "Что вас сильнее всего мотивирует в работе? (необязательно)",
            "required": False,
            "sectionTitle": "Стиль работы",
            "options": [],
        },
        {
            "id": "prof_q13",
            "type": "open",
            "text": "Чего вы бы не хотели в своей будущей работе? (необязательно)",
            "required": False,
            "sectionTitle": "Стиль работы",
            "options": [],
        },
    ],
    "formulas": [
        {
            "id": "prof_f1",
            "name": "Человек-искусство",
            "expression": "prof_q1_prof_o1 * 12 + prof_q2_prof_o5 * 8 + prof_q11_prof_o27 * 10",
            "description": "Склонность к творческим и проектным ролям, дизайну и самовыражению",
        },
        {
            "id": "prof_f2",
            "name": "Человек-знак",
            "expression": "prof_q1_prof_o2 * 12 + prof_q2_prof_o8 * 10 + prof_q3_score * 4",
            "description": "Интерес к данным, знаковым системам, точности и правилам",
        },
        {
            "id": "prof_f3",
            "name": "Человек-человек",
            "expression": "prof_q1_prof_o3 * 12 + prof_q2_prof_o7 * 10 + prof_q11_prof_o24 * 6",
            "description": "Роли с общением, координацией, заботой о людях",
        },
        {
            "id": "prof_f4",
            "name": "Человек-техника",
            "expression": "prof_q1_prof_o4 * 14 + prof_q9_score * 8",
            "description": "Склонность к технике, инженерии, настройке и прикладным задачам",
        },
        {
            "id": "prof_f5",
            "name": "Человек-природа",
            "expression": "prof_q4_prof_o13 * 15 + prof_q7_prof_o16 * 12 + prof_q8_prof_o22 * 10",
            "description": "Интерес к смыслу, пользе для людей и природы, гибким форматам работы",
        },
    ],
    "requiresPersonalData": True,
    "showClientReport": True,
    "scaleInterpretations": [
        {
            "questionId": "prof_q3",
            "ranges": [
                {"min": 1, "max": 2, "text": "Готовность к новым инструментам: низкая — может потребоваться больше поддержки при смене ПО или оборудования."},
                {"min": 3, "max": 5, "text": "Готовность к новым инструментам: средняя — освоение нового даётся с умеренными усилиями."},
                {"min": 6, "max": 7, "text": "Готовность к новым инструментам: высокая — быстро адаптируетесь к новым программам и технике."},
            ],
        },
        {
            "questionId": "prof_q5",
            "ranges": [
                {"min": 1, "max": 2, "text": "Предсказуемый график для вас менее критичен."},
                {"min": 3, "max": 5, "text": "Фиксированные часы работы для вас важны."},
            ],
        },
    ],
    "clientReportTemplate": (
        "Отчёт для клиента\n\nУважаемый(ая) {{clientName}}!\n\nТест: {{testTitle}}\n"
        "{{metrics_lines}}\n\nИнтерпретация:\n{{interpretation}}\n"
    ),
    "professionalReportTemplate": (
        "Служебный отчёт\n\nКлиент: {{clientName}}\nТест: {{testTitle}}\n\n"
        "{{metrics_lines}}\n\n{{interpretation}}\n"
    ),
}

TEAM_CONFIG = {
    "demoVersion": 2,
    "questions": [
        {
            "id": "team_q1",
            "type": "scale",
            "text": "Насколько вам комфортно выступать перед аудиторией (даже небольшой)?",
            "required": True,
            "sectionTitle": "Коммуникация",
            "options": [],
            "scaleMin": 1,
            "scaleMax": 5,
            "scaleMinLabel": "Очень некомфортно",
            "scaleMaxLabel": "Комфортно",
        },
        {
            "id": "team_q2",
            "type": "single",
            "text": "Какой канал общения вы предпочитаете для важных вопросов?",
            "required": True,
            "sectionTitle": "Коммуникация",
            "options": [
                {"id": "team_o1", "text": "Живой разговор / звонок", "weight": 2},
                {"id": "team_o2", "text": "Текст в мессенджере", "weight": 1},
                {"id": "team_o3", "text": "Письмо / документ", "weight": 1},
                {"id": "team_o4", "text": "Видео встреча", "weight": 2},
            ],
        },
        {
            "id": "team_q3",
            "type": "multiple",
            "text": "Какие командные задачи вам обычно заходят лучше?",
            "required": True,
            "sectionTitle": "Коммуникация",
            "options": [
                {"id": "team_o5", "text": "Мозговые штурмы", "weight": 1},
                {"id": "team_o6", "text": "Распределение ролей и сроков", "weight": 1},
                {"id": "team_o7", "text": "Поддержка коллег в стрессе", "weight": 1},
                {"id": "team_o8", "text": "Контроль качества результата", "weight": 1},
            ],
        },
        {
            "id": "team_q4",
            "type": "scale",
            "text": "Как вы переносите жёсткие дедлайны?",
            "required": True,
            "sectionTitle": "Нагрузка",
            "options": [],
            "scaleMin": 1,
            "scaleMax": 5,
            "scaleMinLabel": "Тяжело",
            "scaleMaxLabel": "Нормально",
        },
        {
            "id": "team_q5",
            "type": "number",
            "text": "Сколько параллельных задач вы обычно держите в голове без потери качества?",
            "required": False,
            "sectionTitle": "Нагрузка",
            "options": [],
            "numberMin": 1,
            "numberMax": 15,
        },
        {
            "id": "team_q6",
            "type": "single",
            "text": "Обратная связь по работе вы предпочитаете…",
            "required": True,
            "sectionTitle": "Обратная связь",
            "options": [
                {"id": "team_o9", "text": "Частую и короткую", "weight": 1},
                {"id": "team_o10", "text": "Редкую, но развёрнутую", "weight": 1},
                {"id": "team_o11", "text": "В письменном виде", "weight": 1},
                {"id": "team_o12", "text": "Ненавязчивую, по запросу", "weight": 1},
            ],
        },
        {
            "id": "team_q7",
            "type": "open",
            "text": "Что помогает вам сохранять баланс при высокой нагрузке? (необязательно)",
            "required": False,
            "sectionTitle": "Благополучие",
            "options": [],
        },
    ],
    "formulas": [
        {
            "id": "team_f1",
            "name": "«Публичность»",
            "expression": "team_q1_score * 15 + team_q2_team_o4 * 12",
            "description": "Комфорт видимых и синхронных форматов",
        },
        {
            "id": "team_f2",
            "name": "Структура в команде",
            "expression": "team_q3_team_o6 * 10 + team_q3_team_o8 * 10 + team_q4_score * 8",
            "description": "Организация, контроль, устойчивость к срокам",
        },
        {
            "id": "team_f3",
            "name": "Многозадачность",
            "expression": "team_q5_score * 6 + team_q4_score * 10",
            "description": "Оценка по числу задач и переносимости дедлайнов",
        },
    ],
    "requiresPersonalData": True,
    "showClientReport": True,
    "clientReportTemplate": "",
    "professionalReportTemplate": "",
}

DEMO_TEAM_TITLE = "Стиль работы и коммуникации (пример)"
DEMO_TEAM_TOKEN = "demo-team"

MOTIVATION_CONFIG = {
    "demoVersion": 1,
    "questions": [
        {
            "id": "mot_q1",
            "type": "single",
            "text": "Как часто вы самостоятельно изучаете новое вне работы или учёбы?",
            "required": True,
            "sectionTitle": "Самостоятельность",
            "options": [
                {"id": "mot_o1", "text": "Почти никогда", "weight": 1},
                {"id": "mot_o2", "text": "Редко, по необходимости", "weight": 2},
                {"id": "mot_o3", "text": "Периодически, несколько раз в месяц", "weight": 3},
                {"id": "mot_o4", "text": "Регулярно, еженедельно", "weight": 4},
                {"id": "mot_o5", "text": "Постоянно, это часть моей жизни", "weight": 5},
            ],
        },
        {
            "id": "mot_q2",
            "type": "scale",
            "text": "Насколько вам интересно обучение ради самого процесса познания?",
            "required": True,
            "sectionTitle": "Интерес",
            "options": [],
            "scaleMin": 1,
            "scaleMax": 5,
            "scaleMinLabel": "Совсем не интересно",
            "scaleMaxLabel": "Очень интересно",
        },
        {
            "id": "mot_q3",
            "type": "multiple",
            "text": "Что вас в первую очередь мотивирует учиться? (выберите до 3 вариантов)",
            "required": True,
            "sectionTitle": "Мотивация",
            "options": [
                {"id": "mot_o6", "text": "Карьерный рост и зарплата", "weight": 1},
                {"id": "mot_o7", "text": "Любопытство и интерес к теме", "weight": 2},
                {"id": "mot_o8", "text": "Признание окружающих", "weight": 1},
                {"id": "mot_o9", "text": "Самосовершенствование", "weight": 2},
                {"id": "mot_o10", "text": "Необходимость по работе", "weight": 1},
            ],
        },
        {
            "id": "mot_q4",
            "type": "scale",
            "text": "Как вы оцениваете свою дисциплину в обучении (регулярность, завершение курсов)?",
            "required": True,
            "sectionTitle": "Дисциплина",
            "options": [],
            "scaleMin": 1,
            "scaleMax": 5,
            "scaleMinLabel": "Слабая",
            "scaleMaxLabel": "Высокая",
        },
        {
            "id": "mot_q5",
            "type": "single",
            "text": "Как вы относитесь к ошибкам в процессе обучения?",
            "required": True,
            "sectionTitle": "Отношение к ошибкам",
            "options": [
                {"id": "mot_o11", "text": "Расстраивают, снижают интерес", "weight": 1},
                {"id": "mot_o12", "text": "Принимаю как неизбежность", "weight": 2},
                {"id": "mot_o13", "text": "Воспринимаю как обратную связь для роста", "weight": 4},
                {"id": "mot_o14", "text": "Стимулируют искать новые подходы", "weight": 5},
            ],
        },
    ],
    "formulas": [
        {
            "id": "mot_f1",
            "name": "Внутренняя мотивация",
            "expression": (
                "mot_q1_mot_o3 * 15 + mot_q1_mot_o4 * 20 + mot_q1_mot_o5 * 25 + "
                "mot_q2_score * 12 + mot_q3_mot_o7 * 10 + mot_q3_mot_o9 * 10"
            ),
            "description": "Склонность к обучению ради интереса и саморазвития",
        },
        {
            "id": "mot_f2",
            "name": "Внешняя мотивация",
            "expression": "mot_q3_mot_o6 * 15 + mot_q3_mot_o8 * 12 + mot_q3_mot_o10 * 15",
            "description": "Ориентация на карьеру, признание и внешние стимулы",
        },
        {
            "id": "mot_f3",
            "name": "Устойчивость к трудностям",
            "expression": "mot_q4_score * 15 + mot_q5_mot_o13 * 20 + mot_q5_mot_o14 * 25",
            "description": "Дисциплина и конструктивное отношение к ошибкам",
        },
    ],
    "requiresPersonalData": True,
    "showClientReport": True,
    "clientReportTemplate": (
        "ОТЧЁТ ДЛЯ КЛИЕНТА\nТест: {{testTitle}}\n\nУважаемый(ая) {{clientName}}!\n\n"
        "Благодарим за прохождение теста «Оценка мотивации к обучению». Результаты по шкалам (0–100%):\n\n"
        "{{metrics_lines}}\n\nИНТЕРПРЕТАЦИЯ:\n{{interpretation}}\n\n"
        "Рекомендуем обсудить результаты с психологом или профконсультантом."
    ),
    "professionalReportTemplate": (
        "ПРОФЕССИОНАЛЬНЫЙ ОТЧЁТ\nТест: {{testTitle}}\n\nДанные клиента: {{clientName}}\n"
        "{{clientEmail}}\nВозраст: {{clientAge}}\n\nМЕТРИКИ:\n{{metrics_lines}}\n\n"
        "ИНТЕРПРЕТАЦИЯ:\n{{interpretation}}\n\n--- Рекомендации для психолога ---\n"
        "• Сопоставьте ведущую шкалу с запросом клиента\n"
        "• При низкой «Устойчивости» — проработать стратегии преодоления"
    ),
}

MOTIVATION_TITLE = "Оценка мотивации к обучению"
MOTIVATION_TOKEN = "demo-motivation"
