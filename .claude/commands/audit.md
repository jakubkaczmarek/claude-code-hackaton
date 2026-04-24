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

Group results by file. At the end give a summary: total files with AngularJS remnants, and a priority order for what to tackle next:
1. Controllers (`.controller(`) — migrate to `@Component`
2. Services/factories (`.service(`, `.factory(`) — migrate to `@Injectable`
3. Directives (`.directive(`) — migrate to `@Component` or `@Directive`
4. Filters (`.filter(`) — migrate to `@Pipe`
5. Routing config (`$routeProvider`, `ui-router`) — migrate to `RouterModule`
6. Remaining template patterns (`ng-*`) — update in place
