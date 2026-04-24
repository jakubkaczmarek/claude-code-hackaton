Migrate the AngularJS file at path: $ARGUMENTS

Follow all rules in CLAUDE.md.

## Step 0 — Select and Read the Right Skill

Before writing any code, identify the AngularJS construct and read the corresponding skill file:

| Construct in `$ARGUMENTS` | Skill to read first |
|---------------------------|---------------------|
| `.controller(` or `.component(` | `.agent/skills/migrate-component/SKILL.md` |
| `.service(` or `.factory(` | `.agent/skills/migrate-service/SKILL.md` |
| `.directive(` | `.agent/skills/migrate-component/SKILL.md` (if has template) or `migrate-component` |
| `.filter(` | `.agent/skills/migrate-filter/SKILL.md` |
| `$routeProvider` / `$stateProvider` | `.agent/skills/migrate-route/SKILL.md` |
| `angular.module(` bootstrap | `.agent/skills/migrate-module/SKILL.md` |

Read the skill file completely before proceeding. The skill contains the authoritative mapping tables, patterns, and output format to follow.

## Steps

1. Read the file at `$ARGUMENTS` and identify the AngularJS construct:
   - `.controller(` → Angular `@Component`
   - `.service(` / `.factory(` → Angular `@Injectable`
   - `.directive(` → Angular `@Component` or `@Directive`
   - `.filter(` → Angular `@Pipe`

2. Determine the output file path using CLAUDE.md naming conventions:
   - controller/component → `<name>.component.ts` + `.html` + `.scss`
   - service/factory → `<name>.service.ts`
   - directive → `<name>.directive.ts` or `<name>.component.ts`
   - filter → `<name>.pipe.ts`

3. Apply these migration rules without exception:
   - Use `inject()` for all dependencies — never constructor injection
   - Use `standalone: true` — never NgModule
   - Use `ChangeDetectionStrategy.OnPush` on every component
   - Use Angular 17 `@if` / `@for` control flow — not `*ngIf` / `*ngFor`
   - Add `track <item.id>` on every `@for` loop
   - Replace `$scope` properties with class properties
   - Replace `$scope` methods with class methods
   - Replace `$http` with `inject(HttpClient)`
   - Replace `$q` with `Promise` or RxJS
   - Replace `$state.go()` with `inject(Router).navigate()`
   - Replace `$stateParams` with `inject(ActivatedRoute).snapshot.params`
   - Replace `$timeout` with `setTimeout` (clear in `ngOnDestroy`)
   - Map lifecycle: `$onInit`→`ngOnInit`, `$onDestroy`→`ngOnDestroy`, `$onChanges`→`ngOnChanges`, `$postLink`→`ngAfterViewInit`
   - Use `toSignal()` or `takeUntilDestroyed()` for all subscriptions

4. Create the output file(s) with proper TypeScript types — no `any` unless unavoidable.

5. If the file has an associated template (`.html`), migrate it too using the template mapping table from the skill file read in Step 0.

6. After migration, consider running `/generate-tests` (or reading `.agent/skills/generate-tests/SKILL.md`) to create a spec file for the output.

7. Report when done:
   ```
   Migrated: <input file> → <output file(s)>
   Construct: <controller|service|directive|filter>
   Dependencies injected: <list>
   ⚠️ Manual follow-up: <list any $watch, $broadcast/$emit, $compile, or unmigrated deps>
   ```
