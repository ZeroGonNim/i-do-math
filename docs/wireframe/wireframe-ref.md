# 와이어프레임 참조 테이블

> [wireframe-rules.md](./wireframe-rules.md) 보조 참조용. 필요한 섹션만 선택적으로 참조.

---

## R1. 정렬 파라미터 (MCP 제약)

`create_text`는 `textAlignVertical`을 **지원하지 않음**.
V=CENTER/BOTTOM이 필요한 컴포넌트는 `create_text → resize_node → move_node → set_text_align(H, V)` **4단계 필수**.

| 컴포넌트 | H | V | set_text_align |
|---------|---|---|---|
| Button / TabBar탭 / Modal타이틀 | CENTER | CENTER | ✅ 필수 |
| InputField값 / ListItem / Toast | LEFT | CENTER | ✅ 필수 |
| 라벨·캡션 / DESC항목 | LEFT | TOP | 생략 가능 |
| 금액·퍼센트 | RIGHT | CENTER | ✅ 필수 |

---

## R2. ⛔ HARD RULE: 컴포넌트 내부 정렬

> "대충 가운데쯤" 금지. 공식에 의한 정확한 픽셀값 사용.

```
text.y = comp.y + (comp.h - lineHeight) / 2
icon.y = comp.y + (comp.h - icon.h) / 2
```

**MCP 호출 순서 (버튼 예시)**:
```
1. button={x,y,w,h:52,r:26} → 2. create_text(CENTER,CENTER,15px Bold)
→ 3. resize_node(w:button.w, h:button.h) → 4. move_node(x:0,y:0, parentId=button)
```

**양쪽 정렬 간편법**: 좌/우 모두 동일 width(=콘텐츠 너비) + 동일 x, textAlign만 LEFT/RIGHT 다르게.

---

## R3. 캔버스 배치 (프로젝트 고유)

셀 크기: DT=2000×980(패널520) / LT=1540×848(480) / TB=1260×1104(460) / MB=862×924(440)
행 구분 = ID 접두사(MI, RC, TP…) 단위. 접두사 바뀌면 새 행.

**고정 좌표** (빈 캔버스): `DT.x=80, LT.x=2140, TB.x=3740, MB.x=5060`, `row(i).y=80+i×1184`
단일(MB): `{ x:80+col×922, y:80+row×1004 }`

**동적 계산** (기존 보드): `newScreenX = max(allChildren.map(c=>c.x+c.width)) + 80`

### 보드 공통 규격

| 항목 | DT | LT | TB | MB |
|------|-----|-----|-----|-----|
| 상태바 | - | - | y0 h24 | y0 h44 |
| GNB/헤더 | y0 h64 | y0 h60 | y24 h56 | y44 h56 |
| 콘텐츠시작y | 64 | 60 | 80 | 100 |
| 사이드바 | w240 | w200 | - | - |
| 풋터/탭바 | y840 h60 | y712 h56 | y968 h56 | y788 h56 |
