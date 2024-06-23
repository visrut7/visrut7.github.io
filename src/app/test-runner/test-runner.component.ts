import { Component, Inject, NgZone, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  DefaultMonacoLoader,
  NgxMonacoEditorComponent,
  NGX_MONACO_LOADER_PROVIDER,
  MonacoAPI,
} from '@jean-merelis/ngx-monaco-editor';
import { FormsModule } from '@angular/forms';
import { mochaTypes } from './mocha-types';
import { chaiTypes } from './chai-types';
import TS from 'typescript';
import { MochaGlobals } from 'mocha';

declare const mocha: MochaGlobals;
declare const ts: typeof TS;
let monacoLoader: DefaultMonacoLoader;

@Component({
  selector: 'app-test-runner',
  templateUrl: './test-runner.component.html',
  styleUrls: ['./test-runner.component.css'],
  standalone: true,
  imports: [NgxMonacoEditorComponent, FormsModule],
  providers: [
    {
      provide: NGX_MONACO_LOADER_PROVIDER,
      useFactory: () => {
        if (!monacoLoader) {
          monacoLoader = new DefaultMonacoLoader({
            paths: { vs: 'path/to/vs' },
          });
        }
        return monacoLoader;
      },
    },
  ],
})
export class TestRunnerComponent {
  editorOptions = { theme: 'vs-dark', language: 'typescript' };
  code = `function add(a: number, b: number): number {
  return a + b;
}`;
  testCode = `describe('add', function() {
  it('should add two numbers correctly', function() {
    chai.expect(add(2, 3)).to.equal(5);
  });
});`;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadChaiTypes();
    }
  }

  loadChaiTypes() {
    monacoLoader.monacoLoaded().then((monaco: MonacoAPI) => {
      monaco.languages.typescript.typescriptDefaults.addExtraLib(mochaTypes);
      monaco.languages.typescript.typescriptDefaults.addExtraLib(chaiTypes);
    });
  }

  runTests() {
    if (isPlatformBrowser(this.platformId)) {
      this.ngZone.runOutsideAngular(() => {
        mocha.setup('bdd');

        const compiledCode = ts.transpileModule(this.code, {
          compilerOptions: { module: ts.ModuleKind.CommonJS },
        }).outputText;

        const compiledTestCode = ts.transpileModule(this.testCode, {
          compilerOptions: { module: ts.ModuleKind.CommonJS },
        }).outputText;

        window.eval(compiledCode);
        window.eval(compiledTestCode);

        mocha.run();
      });
    }
  }
}
