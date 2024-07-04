import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  NgZone,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
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
export class TestRunnerComponent implements OnInit, AfterViewInit {
  editorOptions = { theme: 'vs-dark', language: 'typescript' };
  code =
    (isPlatformBrowser(this.platformId) && localStorage.getItem('code')) ||
    `function add(a: number, b: number): number {
  return a + b;
}`;
  testCode =
    (isPlatformBrowser(this.platformId) && localStorage.getItem('testCode')) ||
    `describe('add', function() {
  it('should add two numbers correctly', function() {
    chai.expect(add(2, 3)).to.equal(5);
  });
});`;

  // get runTestButton reference
  @ViewChild('#runTestButton') runTestButton!: ElementRef<HTMLButtonElement>;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadChaiTypes();
    }
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.runTests();
    }
  }

  runTestsHandler() {
    window.location.reload();
  }

  runCodeHandler() {
    this.saveCode();
    this.ngZone.runOutsideAngular(() => {
      const compiledCode = ts.transpileModule(this.code, {
        compilerOptions: { module: ts.ModuleKind.CommonJS },
      }).outputText;

      // clear terminal
      const terminal = document.querySelector('.terminal');
      if (terminal) {
        terminal.innerHTML = '';
      }

      // override console.log
      const originalLog = console.log;
      console.log = function (message: string) {
        originalLog.apply(console);
        terminal?.appendChild(document.createTextNode(message + '\n'));
        terminal?.appendChild(document.createElement('br'));
      };
      window.eval(compiledCode);

      // restore console.log
      console.log = originalLog;
    });
  }

  saveCode() {
    localStorage.setItem('code', this.code);
    localStorage.setItem('testCode', this.testCode);
  }

  private loadChaiTypes() {
    monacoLoader.monacoLoaded().then((monaco: MonacoAPI) => {
      monaco.languages.typescript.typescriptDefaults.addExtraLib(mochaTypes);
      monaco.languages.typescript.typescriptDefaults.addExtraLib(chaiTypes);
    });
  }

  private runTests() {
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

        setTimeout(() => {
          // mocha anchor links should not navigate
          const terminal = document.querySelector('.terminal');
          const anchors = terminal?.querySelectorAll('a');
          anchors?.forEach((anchor) => {
            anchor.addEventListener('click', (event) => {
              event.preventDefault();
            });
          });
        }, 2000);
      });
    }
  }
}
