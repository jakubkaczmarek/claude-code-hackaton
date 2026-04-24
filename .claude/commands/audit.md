Scan the project for remaining AngularJS patterns that have not been migrated yet.

Search for these patterns across all .js, .ts, and .html files:
- `$scope`, `$rootScope` usage
- `.controller(`, `.factory(`, `.service(`, `.directive(`, `.filter(`
- `angular.module(`
- `ng-controller`, `ng-model`, `ng-repeat`, `ng-if`, `ng-show`, `ng-hide`, `ng-click`
- `ng-switch`, `ng-options`, `ng-value`, `ng-form`
- `$http`, `$q`, `$timeout`, `$interval`, `$routeParams`, `$stateParams`
- `$broadcast`, `$emit`, `$on`
- `ui-sref`, `ui-view`, `ng-view`

For each pattern found, report:
- File path and line number
- The pattern detected
- Suggested Angular equivalent

Group results by file. At the end give a summary: total files with AngularJS remnants, and a priority order for what to tackle next (each item includes the skill to use):

1. **Services/factories** (`.service(`, `.factory(`) → use skill `.agent/skills/migrate-service/SKILL.md`
2. **Filters** (`.filter(`) → use skill `.agent/skills/migrate-filter/SKILL.md`
3. **Leaf components / controllers** (`.controller(`, `.component(`) → use skill `.agent/skills/migrate-component/SKILL.md`
4. **Directives** (`.directive(`) → use skill `.agent/skills/migrate-component/SKILL.md`
5. **Routing config** (`$routeProvider`, `$stateProvider`, `ui-router`) → use skill `.agent/skills/migrate-route/SKILL.md`
6. **Bootstrap / module** (`angular.module(`) → use skill `.agent/skills/migrate-module/SKILL.md` (run last)
7. **Remaining template patterns** (`ng-*`) — these will be cleaned up automatically as part of the component migrations above

For each file listed, suggest the exact command to run next, e.g.:
```
/migrate src/app/auth/auth.service.js
```
