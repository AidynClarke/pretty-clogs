/* eslint-disable max-classes-per-file */
import Logger from '../src/index';
import { generateTestObject } from './helpers';

Logger.init();

console.log('test', generateTestObject('object', { min: 1, max: 10 }, 2));

// class TestClass {
//   prop: string;

//   public publicProp: string;

//   protected protectedProp: string;

//   private privateProp: string;

//   private childClass: ChildClass;

//   constructor(prop: string) {
//     this.prop = prop;
//     this.publicProp = prop;
//     this.protectedProp = prop;
//     this.privateProp = prop;
//     this.childClass = new ChildClass(prop);
//   }

//   public printProps() {
//     console.log(`this.prop: `, this.prop);
//     console.log(`this.publicProp: `, this.publicProp);
//     console.log(`this.protectedProp: `, this.protectedProp);
//     console.log(`this.privateProp: `, this.privateProp);
//   }
// }

// class ChildClass {
//   constructor(private prop: string) {}
// }

// const testClass = new TestClass('test');

// console.log(`testClass instanceof class: `, testClass.constructor.toString());

// console.log('test class instance', testClass);
// console.log(`testClass.toString(): `, testClass.toString());
