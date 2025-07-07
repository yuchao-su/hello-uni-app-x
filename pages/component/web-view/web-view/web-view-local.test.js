const platformInfo = process.env.uniTestPlatformInfo.toLocaleLowerCase()
const isWeb = platformInfo.startsWith('web')
const isMP = platformInfo.startsWith('mp')
const isHarmony = platformInfo.startsWith('harmony')
const isIOS = platformInfo.startsWith('ios')

describe('component-native-web-view', () => {
  if(isWeb || isMP || process.env.UNI_AUTOMATOR_APP_WEBVIEW || isIOS){
    it('not support', () => {
      expect(1).toBe(1)
    })
    return
  }

    let page;
    let start = 0;
    beforeAll(async () => {
      page = await program.reLaunch('/pages/component/web-view/web-view/web-view-local');
      await page.waitFor(1000);
    });

    it('check_load_url', async () => {
      expect(await page.data('loadError')).toBe(false)
    });

    it('screenshot', async () => {
      await page.waitFor(async () => {
        return await page.data('loadFinish') === true;
      });
      const image = await program.screenshot({
        fullPage: true
      });
      expect(image).toSaveImageSnapshot();
    });

    it('test event download', async () => {
      if(isHarmony) {
        // 鸿蒙保存文件会出现弹窗无法关闭，影响自动化测试，暂时屏蔽此测试
        expect(1).toBe(1)
        return
      }
      await page.setData({
        autoTest: true
      });
      await page.callMethod('testEventDownload');
      start = Date.now();
      await page.waitFor(async () => {
        return (await page.data('eventDownload')) || (Date.now() - start > 1000);
      });
      if (isIOS) {
        // expect(await page.data('eventDownload')).toEqual({
        //   tagName: 'WEB-VIEW',
        //   type: 'download',
        //   url: 'https://web-ext-storage.dcloud.net.cn/uni-app-x/pkg/hello-uniappx.apk',
        //   userAgent: `uni-app-x/${process.env.HX_Version.split('-')[0].split('.').slice(0, 2).join('.')}`,
        //   contentDisposition: '',
        //   mimetype: 'application/vnd.android.package-archive',
        //   isContentLengthValid: true
        // });
        return;
      }
      const infos = process.env.uniTestPlatformInfo.split(' ');
      const version = parseInt(infos[infos.length - 1]);
      if (version == 8) return; // android8测试结果不稳定
      if (version >= 9) {
        expect(await page.data('eventDownload')).toEqual({
          tagName: 'WEB-VIEW',
          type: 'download',
          url: 'https://web-ext-storage.dcloud.net.cn/uni-app-x/pkg/hello-uniappx.apk',
          userAgent: `uni-app-x/${process.env.HX_Version.split('-')[0].split('.').slice(0, 2).join('.')}`,
          contentDisposition: `attachment; filename="hello-uniappx.apk"; filename*=utf-8''hello-uniappx.apk`,
          mimetype: 'application/vnd.android.package-archive',
          isContentLengthValid: true
        });
      } else if (version >= 7) { // 低版本webview内核，部分属性无有效值
        expect(await page.data('eventDownload')).toEqual({
          tagName: 'WEB-VIEW',
          type: 'download',
          url: 'https://web-ext-storage.dcloud.net.cn/uni-app-x/pkg/hello-uniappx.apk',
          userAgent: '',
          contentDisposition: '',
          mimetype: '',
          isContentLengthValid: false
        });
      }
    });

    it('test event message', async () => {
      const infos = process.env.uniTestPlatformInfo.split(' ');
      const version = parseInt(infos[infos.length - 1]);
      if (process.env.uniTestPlatformInfo.startsWith('android') && version > 6) {
        await page.callMethod('testEventMessage');
        start = Date.now();
        await page.waitFor(async () => {
          return (await page.data('eventMessage')) || (Date.now() - start > 500);
        });
        expect(await page.data('eventMessage')).toEqual({
          tagName: 'WEB-VIEW',
          type: 'message',
          data: [{
            action: 'message'
          }]
        });
      }
      await page.setData({
        autoTest: false
      });
    });
});
