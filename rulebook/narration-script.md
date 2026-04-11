# 규칙 설명서 나레이션 스크립트

`rulebook-narration.mp3`의 원본 스크립트입니다. 문구를 수정하면
섹션별 MP3를 재생성한 뒤 `ffmpeg`로 다시 합치고, 마지막으로
`rulebook/index.html`의 `markers` 배열(약 1100줄)에 있는 각 섹션의
`time` 값을 `ffprobe`로 재측정해 업데이트해야 합니다.

- 파이프라인 참고: `/Users/kimkanghoon/mini project/work3/output/sections/`
  - 기존 섹션별 MP3 7개(00-intro ~ 06-phase4)
  - `concat.txt` (ffmpeg concat demuxer용)
  - `ambient.mp3` (100.99초, 배경 음악 — **재사용 가능**)
  - `voice_only.mp3` (보이스 합본) / `rulebook-narration.mp3` (최종 믹스)
- 음색/페이스 기준: edge-tts 한국어 여성 보이스(추정), 약간 느긋한 낭독
- 톤: 차분한 내레이션, 미스터리 분위기, 수식어는 최소화
- 섹션 경계 = `markers` 배열의 각 엔트리에 대응
- **별첨 안내(4인용 《뱀이 죽은 축제》 기준 문구)는 나레이션에 넣지 않습니다.**
  HTML 푸터에만 노출됩니다.

---

> **문장 규칙**: 모든 문장은 반드시 **"~입니다"(또는 ~됩니다/~합니다)**로 종결.
> 체언(명사) 종결 금지. 명령형("~하세요") 금지.
> **핵심만 전달합니다.** 과한 설명·부연·수식어는 HTML이 담당하므로 나레이션에서는 제거.

---

## §0. 인트로 (Hero) — 약 6초

> 프로젝트 덜지, 머더 미스터리 시리즈입니다.
> 지금부터 게임 규칙을 안내합니다.

---

## §1. 핵심 요약 — 약 12초

> 게임은 네 단계로 진행됩니다.
> 캐릭터를 고르고, 단서를 모아 토론하고, 동시에 범인을 지목합니다.
> 범인을 찾는 것만이 전부는 아닙니다. 자신의 비밀을 지키는 것도 승리 조건입니다.

---

## §2. 승리 조건 — 약 18초

> 승패는 세 가지 점수로 갈립니다.
> 첫째, 검거 점수. 과반수가 진범을 지목하면 전원이 점수를 얻습니다.
> 둘째, 지목 점수. 내가 진범을 맞히면 나만 점수를 얻습니다.
> 셋째, 비밀 점수. 내 비밀을 끝까지 인정하지 않으면 그대로 유지됩니다.

---

## §3. 오프닝 — 약 12초

> 게임을 시작하기 전, 맵을 펼치고 캐릭터를 정합니다.
> 소지품 카드 두 장을 손에 들고, 캐릭터 시트를 혼자 읽어둡니다.
> 귓속말은 금지되며, 모든 대화는 전체 공개로 진행됩니다.

---

## §4. 탐색 — 약 18초

> 탐색은 네 라운드 동안 반복됩니다.
> 자기 차례에 카드 한 장을 가져와 혼자 확인합니다.
> 손에는 최대 두 장까지 들 수 있습니다.
> 중앙에 카드 여섯 장이 쌓이면 즉시 토론으로 넘어갑니다.
> 정보를 숨길지, 공개할지, 거짓으로 말할지는 자유입니다.

---

## §5. 투표 — 약 10초

> 네 라운드가 끝나면 각자 자신의 추리를 변론합니다.
> 그리고 "하나, 둘, 셋"에 맞춰 동시에 범인을 지목합니다.
> NPC를 포함한 스토리 속 모든 인물이 지목 대상이 됩니다.

---

## §6. 엔딩 — 약 12초

> 투표 결과에 따라 엔딩이 달라집니다.
> QR 코드를 스캔해 결말을 확인합니다.
> 각 캐릭터에게는 자신만의 비밀 목표가 있습니다.
> 진상 규명과 개인 목표, 두 가지를 모두 이루었을 때 완전한 승리가 됩니다.

---

## MP3 재생성 가이드

기존 파이프라인은 `/Users/kimkanghoon/mini project/work3/output/sections/`에
있습니다. 동일한 구조를 유지하면 `ambient.mp3`를 그대로 재사용할 수 있습니다.

```bash
WORK=/Users/kimkanghoon/mini\ project/work3/output/sections
OUT=/Users/kimkanghoon/project-dullg.github.io/rulebook

# 1) 섹션별 MP3 생성 (edge-tts 기준, 한국어 여성 보이스)
edge-tts --voice ko-KR-SunHiNeural --rate=-5% \
  --text "§0 본문..." --write-media "$WORK/00-intro.mp3"
edge-tts --voice ko-KR-SunHiNeural --rate=-5% \
  --text "§1 본문..." --write-media "$WORK/01-summary.mp3"
# ... 02-scoring, 03-phase1, 04-phase2, 05-phase3, 06-phase4

# 2) 보이스 합본 (concat demuxer)
cd "$WORK"
ffmpeg -y -f concat -safe 0 -i concat.txt -c copy voice_only.mp3

# 3) 앰비언트와 믹스 (기존 믹스 비율 유지)
ffmpeg -y -i voice_only.mp3 -i ambient.mp3 \
  -filter_complex "[1:a]volume=0.15,apad[bg];[0:a][bg]amix=inputs=2:duration=first:dropout_transition=0" \
  -ac 1 -ar 24000 -b:a 48k \
  "$OUT/rulebook-narration.mp3"

# 4) 각 섹션 경계 타임스탬프 재측정
cd "$WORK"
python3 -c "
import subprocess
acc = 0.0
for f in ['00-intro.mp3','01-summary.mp3','02-scoring.mp3','03-phase1.mp3','04-phase2.mp3','05-phase3.mp3','06-phase4.mp3']:
    d = float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f]))
    print(f'{f}: start={acc:.3f}s  dur={d:.3f}s  (round→{round(acc)})')
    acc += d
"
# → 출력된 반올림 값을 index.html 의 markers[].time 에 반영
```

**주의**: 앰비언트 볼륨(`volume=0.15`)은 추정값입니다. 기존 파일의 실제 mix 비율을
확인하려면 `ffmpeg -i voice_only.mp3 -i ambient.mp3 -filter_complex "amix..." ` 명령을
`work3`의 셸 히스토리에서 찾거나, 청감상 맞춰가며 조정하세요.
