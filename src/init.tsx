// 将Base64图片保存到本地文件
function saveImageToFile(base64Data: string, filename: string) {
  // 这里需要根据AutoX.js的文件操作API来实现
  // 通常会使用files.writeBytes()或类似函数
  // 以下是示例代码，可能需要根据实际API调整
  const path = files.join(files.cwd(), filename)
  files.writeBytes(path, android.util.Base64.decode(base64Data, android.util.Base64.DEFAULT))
  return path
}

export default function initial() {
  // 使用图片创建AssistiveTouch风格的悬浮按钮
  var floatyWindow: any = floaty.rawWindow(
    <frame>
      <img
        id="assistiveTouch"
        src="file:///sdcard/脚本/dist/static/assistiveTouch-transparent.png"
        w="60dp"
        h="60dp"
        scaleType="fitXY"
      />
    </frame>,
  )

  // 设置初始位置（右侧居中，距离边缘20px）
  const initialX = device.width - 80
  const initialY = device.height / 2 - 30
  floatyWindow.setPosition(initialX, initialY)

  // 窗口边界限制
  const minX = 0,
    minY = 0
  const maxX = device.width - 60
  const maxY = device.height - 60

  // 添加触摸效果和拖动功能
  let lastX = initialX,
    lastY = initialY
  let isDragging = false
  let pressStartTime = 0
  let windowX = initialX,
    windowY = initialY
  let touchStartX = 0,
    touchStartY = 0

  floatyWindow.assistiveTouch.setOnTouchListener((view: any, event: any) => {
    const x = event.getRawX()
    const y = event.getRawY()

    switch (event.getAction()) {
      case event.ACTION_DOWN:
        pressStartTime = new Date().getTime()
        touchStartX = x
        touchStartY = y

        // 按下时的视觉反馈
        ui.run(() => {
          view.attr("alpha", "0.7") // 降低透明度
          view.attr("scaleX", 0.92) // 缩小效果
          view.attr("scaleY", 0.92)
        })
        break

      case event.ACTION_MOVE:
        const dx = x - lastX
        const dy = y - lastY

        // 计算移动距离，判断是否为拖动
        const moveDistance = Math.sqrt(Math.pow(x - touchStartX, 2) + Math.pow(y - touchStartY, 2))
        if (moveDistance > 10) {
          isDragging = true
        }

        windowX = Math.min(maxX, Math.max(minX, windowX + dx))
        windowY = Math.min(maxY, Math.max(minY, windowY + dy))

        ui.run(() => {
          floatyWindow.setPosition(windowX, windowY)
        })
        break

      case event.ACTION_UP:
        ui.run(() => {
          view.attr("alpha", "1") // 恢复透明度
          view.attr("scaleX", 1) // 恢复大小
          view.attr("scaleY", 1)

          // 如果不是拖动且点击时间小于200ms，则显示菜单
          if (!isDragging && new Date().getTime() - pressStartTime < 200) {
            showMenu(floatyWindow)
          } else if (isDragging) {
            // 吸附到屏幕边缘的效果
            snapToEdge()
          }
        })
        isDragging = false
        break
    }

    lastX = x
    lastY = y
    return true
  })

  // 吸附到屏幕边缘的功能
  function snapToEdge() {
    let targetX = windowX

    // 如果靠近左边缘，吸附到左边
    if (windowX < device.width * 0.2) {
      targetX = 0
    }
    // 如果靠近右边缘，吸附到右边
    else if (windowX > device.width * 0.8) {
      targetX = device.width - 60
    }

    // 使用动画效果移动到边缘
    animatePosition(targetX, windowY)
  }

  // 位置动画效果
  function animatePosition(targetX: number, targetY: number) {
    const duration = 300 // 动画持续时间（毫秒）
    const startTime = new Date().getTime()
    const startX = windowX
    const startY = windowY

    // 使用定时器创建动画效果
    const timer = setInterval(() => {
      const elapsed = new Date().getTime() - startTime
      let progress = Math.min(elapsed / duration, 1)

      // 使用缓动函数使动画更自然
      progress = easeOutQuad(progress)

      windowX = startX + (targetX - startX) * progress
      windowY = startY + (targetY - startY) * progress

      ui.run(() => {
        floatyWindow.setPosition(windowX, windowY)
      })

      if (progress >= 1) {
        clearInterval(timer)
      }
    }, 16) // 约60fps的刷新率
  }

  // 缓动函数
  function easeOutQuad(t) {
    return t * (2 - t)
  }

  return floatyWindow
}

// 显示iOS风格的功能菜单
function showMenu(floatyWindow: any) {
  // 创建半透明背景遮罩
  const overlay: any = floaty.rawWindow(<frame id="overlay" bg="#80000000" />)
  overlay.setSize(device.width, device.height)
  overlay.setTouchable(true)

  // 创建菜单容器
  const menu: any = floaty.rawWindow(
    <frame bg="#00000000">
      <frame id="menuContainer" bg="#FFFFFF" cornerRadius="20dp" elevation="10dp" alpha="0" scaleX="0.8" scaleY="0.8">
        <vertical padding="8dp">
          <horizontal gravity="center" margin="8dp 4dp">
            <card
              id="btnNavigation"
              w="70dp"
              h="70dp"
              cardCornerRadius="35dp"
              cardElevation="2dp"
              margin="8dp"
              foreground="?selectableItemBackground"
            >
              <frame bg="#F0F0F0" w="*" h="*">
                <text text="🧭" textSize="24sp" gravity="center" />
              </frame>
            </card>
            {/* <frame id="btnNavigation" w="70dp" h="70dp" cornerRadius="35dp" bg="#F0F0F0" margin="8dp">
              <text text="🧭" textSize="24sp" gravity="center" />
            </frame> */}
            <card
              id="btnBack"
              w="70dp"
              h="70dp"
              cardCornerRadius="35dp"
              cardElevation="2dp"
              margin="8dp"
              foreground="?selectableItemBackground"
            >
              <frame bg="#F0F0F0" w="*" h="*">
                <text text="⬅️" textSize="24sp" gravity="center" />
              </frame>
            </card>
          </horizontal>
          <horizontal gravity="center" margin="8dp 4dp">
          <card
              id="btnRecent"
              w="70dp"
              h="70dp"
              cardCornerRadius="35dp"
              cardElevation="2dp"
              margin="8dp"
              foreground="?selectableItemBackground"
            >
              <frame bg="#F0F0F0" w="*" h="*">
                <text text="📱" textSize="24sp" gravity="center" />
              </frame>
            </card>
            <card
              id="btnClose"
              w="70dp"
              h="70dp"
              cardCornerRadius="35dp"
              cardElevation="2dp"
              margin="8dp"
              foreground="?selectableItemBackground"
            >
              <frame bg="#F0F0F0" w="*" h="*">
                <text text="❌" textSize="24sp" gravity="center" />
              </frame>
            </card>
          </horizontal>
        </vertical>
      </frame>
    </frame>,
  )

  // 计算菜单位置
  const menuWidth = 200,
    menuHeight = 200
  const menuX = (device.width - menuWidth) / 2
  const menuY = (device.height - menuHeight) / 2

  menu.setPosition(menuX, menuY)
  menu.setSize(menuWidth, menuHeight)

  // 添加菜单出现的动画效果
  ui.run(() => {
    const menuContainer = menu.menuContainer
    menuContainer.attr("alpha", "1")
    menuContainer.attr("scaleX", "1")
    menuContainer.attr("scaleY", "1")
    menuContainer.attr("translationY", "0")
  })

  // 地图导航
  menu.btnNavigation.click(() => {
    // home() // 返回主屏幕
    app.launch("com.tencent.mm") || toast("未安装微信");
    media.playMusic("/sdcard/脚本/dist/static/auto-navigation.mp3");
    //让音乐播放完
    // sleep(media.getMusicDuration()); 注意：sleep() 是阻塞操作，不能直接在 UI 线程里使用。menu.btnNavigation.click() 属于 UI 线程事件回调，不能写阻塞式逻辑（像 sleep()、文件读写、网络请求等）。
    setTimeout(() => {
      closeMenu();
    }, media.getMusicDuration()); // 毫秒单位
    closeMenu()
  })

  menu.btnBack.click(() => {
    back()
    closeMenu()
  })

  menu.btnRecent.click(() => {
    recents()
    closeMenu()
  })

  menu.btnClose.click(() => {
    closeMenu()
  })

  // 点击遮罩关闭菜单
  overlay.overlay.click(() => {
    closeMenu()
  })

  function closeMenu() {
    // 添加关闭动画
    ui.run(() => {
      const menuContainer = menu.menuContainer
      menuContainer.attr("alpha", "0")
      menuContainer.attr("scaleX", "0.8")
      menuContainer.attr("scaleY", "0.8")

      // 延迟关闭窗口，等待动画完成
      setTimeout(() => {
        menu.close()
        overlay.close()
      }, 200)
    })
  }
}
