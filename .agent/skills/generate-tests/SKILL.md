---
name: Generate Angular Unit Tests
description: Generates a basic Angular 17 unit test file (.spec.ts) for a freshly migrated component, service, pipe, or directive using TestBed and Jest/Jasmine.
---

# Generate Angular Unit Tests

Generate a unit test file for: `$ARGUMENTS`

---

## Step 1 — Read the Source File

Read the file at `$ARGUMENTS` and identify:
- Type: `@Component` | `@Injectable` | `@Pipe` | `@Directive`
- Public methods and their signatures
- `@Input()` / `input()` properties
- `@Output()` / `output()` events
- Injected dependencies (via `inject()`)
- HTTP calls (need `HttpClientTestingModule` / `provideHttpClientTesting()`)
- Router usage (need `RouterTestingModule` or `provideRouter([])`)
- Signals and their initial values

---

## Step 2 — Determine Test Framework

Check `package.json` for:
- `jest` → use Jest (`describe`, `it`, `expect`, `jest.fn()`)
- `jasmine` / `karma` → use Jasmine (`describe`, `it`, `expect`, `jasmine.createSpy()`)

Default to Jest if unclear.

---

## Step 3 — Generate the Spec File

Create `<name>.component.spec.ts` / `<name>.service.spec.ts` / etc.

### Component Test Template
```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { <Name>Component } from './<name>.component';

describe('<Name>Component', () => {
  let component: <Name>Component;
  let fixture: ComponentFixture<<Name>Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [<Name>Component],  // standalone component — import directly
    }).compileComponents();

    fixture = TestBed.createComponent(<Name>Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // One test per public method
  // One test per @Input binding
  // One test per @Output event
});
```

### Service Test Template
```ts
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { <Name>Service } from './<name>.service';

describe('<Name>Service', () => {
  let service: <Name>Service;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(<Name>Service);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // One test per public method
  // Test HTTP calls with httpMock.expectOne()
  // Test signal state changes
});
```

### Pipe Test Template
```ts
import { <Name>Pipe } from './<name>.pipe';

describe('<Name>Pipe', () => {
  let pipe: <Name>Pipe;

  beforeEach(() => {
    pipe = new <Name>Pipe();
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  it('should transform <input> to <expected>', () => {
    expect(pipe.transform(<input>)).toBe(<expected>);
  });
});
```

---

## Step 4 — Write Meaningful Tests

For each public method, generate:
1. **Happy path** — expected input → expected output
2. **Edge case** — null/undefined/empty input
3. **Error case** — if the method can throw or return an error state

For `@Input` properties:
```ts
it('should display the user name', () => {
  component.user = { id: 1, name: 'Alice' };
  fixture.detectChanges();
  const el = fixture.nativeElement.querySelector('h1');
  expect(el.textContent).toContain('Alice');
});
```

For `@Output` events:
```ts
it('should emit save event on button click', () => {
  const saveSpy = jest.fn();
  component.save.subscribe(saveSpy);
  fixture.nativeElement.querySelector('button').click();
  expect(saveSpy).toHaveBeenCalled();
});
```

For HTTP calls in services:
```ts
it('should fetch users', () => {
  const mockUsers: User[] = [{ id: 1, name: 'Alice' }];
  service.getUsers().subscribe(users => {
    expect(users).toEqual(mockUsers);
  });
  const req = httpMock.expectOne('/api/users');
  expect(req.request.method).toBe('GET');
  req.flush(mockUsers);
});
```

For signals:
```ts
it('should update loading signal', () => {
  expect(service.loading()).toBe(false);
  service.load();
  expect(service.loading()).toBe(true);
});
```

### Mocking Dependencies
Use `TestBed.overrideProvider` or provide mocks in `providers`:
```ts
const mockUserService = { getUsers: jest.fn().mockReturnValue(of([])) };

TestBed.configureTestingModule({
  imports: [<Name>Component],
  providers: [
    { provide: UserService, useValue: mockUserService },
  ],
});
```

---

## Step 5 — Summary

```
## Tests Generated

File created: src/app/<path>/<name>.spec.ts

Tests written: <count>
  ✓ should create
  ✓ <list of test descriptions>

Dependencies mocked:
  <list>

⚠️  Manual follow-up:
  - Complex async flows that need custom marble testing
  - Integration tests that require a real router setup
  - Tests for private methods (consider testing via public API instead)
```
