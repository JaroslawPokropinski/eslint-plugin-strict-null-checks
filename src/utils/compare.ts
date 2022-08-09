import {
  getConstrainedTypeAtLocation,
  isNullableType,
  isTypeAnyType,
} from "@typescript-eslint/type-utils";
import { hasOnlyExpressionInitializer, Type, TypeChecker } from "typescript";

/**
 * Compare types such as if object on the left is non nullable and one on the right is then they do not match. It will also check for nested objects.
 * @param left type of left side of assignment
 * @param right type of right side of assignment
 * @param checker
 * @returns true if assignment is possible (from null safety side)
 */
export function compareTypeObjects(
  left: Type,
  right: Type,
  checker: TypeChecker,
  recursionStack?: any[] = []
) {
  if (recursionStack.includes(left)) {
    return true;
  }
  recursionStack.push(left);
  for (let leftProperty of left.getProperties()) {
    // handle only case where leftProperty.valueDeclaration is prop signature for now
    if (!leftProperty.valueDeclaration) continue;
    if (!hasOnlyExpressionInitializer(leftProperty.valueDeclaration)) continue;
    const leftPropertyType = getConstrainedTypeAtLocation(
      checker,
      leftProperty.valueDeclaration.name
    );
    // if any or nullable on the left then skip
    if (isNullableType(leftPropertyType)) continue;
    if (isTypeAnyType(leftPropertyType)) continue;

    // find matching property on the right
    const matchingRightProp = right
      .getProperties()
      .find((prop) => prop.name === leftProperty.name);

    // if property is missing on the right then it is not matching
    if (!matchingRightProp) return false;

    // handle only case where rightProperty.valueDeclaration is prop signature for now
    if (!matchingRightProp.valueDeclaration) continue;
    if (!hasOnlyExpressionInitializer(matchingRightProp.valueDeclaration))
      continue;
    const rightPropertyType = getConstrainedTypeAtLocation(
      checker,
      matchingRightProp.valueDeclaration.name
    );

    if (isNullableType(rightPropertyType)) return false;
    // if (isTypeAnyType(rightPropertyType)) return false;
    if (!compareTypeObjects(leftPropertyType, rightPropertyType, checker, recursionStack))
      return false;
  }

  return true;
}
