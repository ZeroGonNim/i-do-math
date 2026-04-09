from playwright.sync_api import sync_playwright
import time
import os

def run_test():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 390, 'height': 844}) # 모바일 뷰포트
        page = context.new_page()
        
        # 1. 앱 접속 (로컬 서버 이미 실행 중 가정)
        page.goto('http://localhost:5173')
        page.wait_for_load_state('networkidle')
        
        # 2. 로컬 스토리지에 유저 정보 심어서 온보딩 건너뛰기
        page.evaluate("""() => {
            const user = {
                userId: 'test-user',
                displayName: '테스트',
                grade: 4,
                level: 1,
                totalStars: 100,
                unlockedDifficulty: 'applied',
                characterId: 'char-01'
            };
            // Dexie DB에 유저 정보 직접 넣기 (onboarding.tsx 참고)
            const request = indexedDB.open('IDoMathDB', 1);
            request.onsuccess = (e) => {
                const db = e.target.result;
                const tx = db.transaction('userProfile', 'readwrite');
                tx.objectStore('userProfile').put(user);
            };
        }""")
        page.reload()
        page.wait_for_load_state('networkidle')
        
        # 3. 그리기 문제로 직접 이동하기 위해 window.history.pushState 사용
        # (문제를 수동으로 찾는 대신 강제로 라우팅)
        # 우선 문제 데이터를 가져와서 전달
        page.evaluate("""async () => {
            const res = await fetch('/data/problems-v1.json');
            const data = await res.json();
            const problem = data.problems.find(p => p.answerType === 'draw');
            window.location.href = '#/problem'; // SPA 라우팅 호환을 위해
            // 리액트 라우터 state는 location.href로 조작 불가하므로 
            // 실제 앱 로직을 타기 위해 홈에서 시작하여 클릭 유도 필요
        }""")
        
        # 실제 앱 로직을 타고 문제 화면으로 가기
        # '학습 시작하기' 버튼 클릭 (HomeRoute)
        page.wait_for_selector('button:has-text("학습 시작하기")')
        page.click('button:has-text("학습 시작하기")')
        
        # 문제 화면 진입 대기
        page.wait_for_selector('canvas', timeout=10000)
        page.screenshot(path='problem_screen.png')
        
        # 4. 그림 그리기 (캔버스 중앙에 사각형 그리기)
        canvas = page.locator('canvas')
        box = canvas.bounding_box()
        page.mouse.move(box['x'] + 50, box['y'] + 50)
        page.mouse.down()
        page.mouse.move(box['x'] + 150, box['y'] + 150)
        page.mouse.up()
        
        # 5. 정답 확인 버튼 클릭 (DrawProblem 내부의 첫 번째 단계)
        page.click('button:has-text("정답 확인")')
        page.wait_for_timeout(500) # 애니메이션 대기
        
        # '맞게 그렸어' 버튼 클릭 (ResultRoute로 이동)
        page.click('button:has-text("맞게 그렸어")')
        
        # 6. 결과 화면 대기 및 캡처
        page.wait_for_selector('text=정답 비교', timeout=5000)
        time.sleep(2) # 오버레이 사라질 때까지 대기
        page.screenshot(path='result_drawing_comparison.png')
        
        print("스크린샷 저장 완료: result_drawing_comparison.png")
        browser.close()

if __name__ == "__main__":
    run_test()
