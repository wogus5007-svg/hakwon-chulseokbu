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
echo "   📋 학원 출석부 - 처음 설치하기"
echo "========================================="
echo ""

# Node.js 확인
if ! command -v node &> /dev/null; then
  echo "❌ Node.js가 설치되지 않았습니다."
  echo ""
  echo "아래 주소에서 Node.js를 먼저 설치해주세요:"
  echo "https://nodejs.org (LTS 버전 권장)"
  echo ""
  echo "설치 후 이 파일을 다시 실행해주세요."
  read -p "아무 키나 누르면 창이 닫힙니다..."
  exit 1
fi

echo "✅ Node.js 확인 완료 ($(node --version))"
echo ""
echo "📦 필요한 파일을 설치하는 중입니다..."
echo "   (처음 한 번만 실행되며, 인터넷 속도에 따라 1~3분 걸릴 수 있습니다)"
echo ""

npm install

if [ $? -ne 0 ]; then
  echo ""
  echo "❌ 설치에 실패했습니다. 인터넷 연결을 확인해주세요."
  read -p "아무 키나 누르면 창이 닫힙니다..."
  exit 1
fi

echo ""
echo "✅ 설치 완료!"
echo ""
echo "🌐 서버가 켜지면 브라우저가 자동으로 열립니다."
echo "   화면의 안내를 따라 구글 시트 연동을 설정해주세요."
echo ""
echo "⚠️  이 창은 앱이 실행되는 동안 열려 있어야 합니다."
echo "   앱을 종료하려면 이 창을 닫으세요."
echo ""

# 서버가 완전히 켜진 후 브라우저 열기
(
  echo "🔄 서버 시작을 기다리는 중..."
  until curl -s http://localhost:3000 > /dev/null 2>&1; do
    sleep 1
  done
  echo "✅ 서버 준비 완료! 브라우저를 엽니다..."
  open http://localhost:3000/setup
) &

npm run dev
