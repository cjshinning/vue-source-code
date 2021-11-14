let id = 0;
class Dep { //每个属性我都给他分配一个dep，dep可以存放watcher，watcher中还要存放这个dep
  constructor() {
    this.id = id++;
    this.subs = [];
  }
  depend() {
    // Dep.target dep里面要存放这个watcher，watcher要存放dep 多对多
    if (Dep.target) {
      Dep.target.addDep(this);
    }
  }
  addSub(watcher) {
    this.subs.push(watcher);
  }
}
Dep.target = null;  //一份

export function pushTarget(watcher) {
  Dep.target = watcher;
}

export function popTarget() {
  Dep.target = null;
}

export default Dep;