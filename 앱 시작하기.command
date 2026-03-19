#!/bin/bash
cd "$(dirname "$0")"

# npm 경로 등록 (더블클릭 실행 시 PATH가 제한되는 문제 해결)
export PATH="/usr/local/bin:/opt/homebrew/bin:/opt/homebrew/sbin:$HOME/.nvm/versions/node/$(ls $HOME/.nvm/versions/node 2>/dev/null | tail -1)/bin:$PATH"

# zsh / bash 프로필 로드 시도
[ -f "$HOME/.zshrc" ] && source "$HOME/.zshrc" 2>/dev/null
[ -f "$HOME/.bash_profile" ] && source "$HOME/.bash_profile" 2>/dev/null
[ -f "$HOME/.profile" ] && source "$HOME/.profile" 2>/dev/null

echo ""
echo "========================================="
echo "   📋 학원 출석부 시작 중..."
echo "========================================="
echo ""

# npm 확인
if ! command -v npm &> /dev/null; then
  echo "❌ npm을 찾을 수 없습니다."
  echo ""
  echo "해결 방법: 터미널 앱을 직접 열고 아래 명령어를 입력하세요:"
  echo ""
  echo "  cd \"$(pwd)\""
  echo "  npm run dev"
  echo ""
  read -p "아무 키나 누르면 창이 닫힙니다..."
  exit 1
fi

echo "✅ npm 확인 완료"
echo ""
echo "⚠️  이 창은 앱이 실행되는 동안 열려 있어야 합니다."
echo "   앱을 종료하려면 이 창을 닫으세요."
echo ""

# 서버가 완전히 켜진 후 브라우저 열기
(
  until curl -s http://localhost:3000 > /dev/null 2>&1; do
    sleep 1
  done
  echo "✅ 서버 준비 완료! 브라우저를 엽니다..."
  open http://localhost:3000
) &

npm run dev
