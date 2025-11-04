import { provideFASTDesignSystem, fastDesignSystemProvider, fastButton, fastCard, fastTextField, fastSwitch, fastProgressRing } from "@microsoft/fast-components";

export function registerFAST() {
  provideFASTDesignSystem()
    .register(
      fastDesignSystemProvider(),
      fastButton(),
      fastCard(),
      fastTextField(),
      fastSwitch(),
      fastProgressRing(),
    );
}
